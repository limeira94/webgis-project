import json
import tempfile
import os
import zipfile
import geopandas as gpd

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.views import LoginView
from django.contrib.gis.geos import GEOSGeometry, GeometryCollection
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.db import connection
from django.db.models import Q
from django.db.utils import ProgrammingError
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets, views
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from .models import GeoJSONFile, Project, RasterFile, Vector
from .serializers import *

from shapely.geometry import box

class ProjectList(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            data = request.data
            data["user"] = request.user.pk
            serializer = ProjectSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Authentication credentials were not provided.'},status=status.HTTP_401_UNAUTHORIZED)


    def get(self, request):
        if request.user.is_authenticated:
            projects = Project.objects.filter(user=request.user)
        else:
            projects = Project.objects.filter(public=True)

        project_serializer = ProjectSerializer(projects, many=True)
        return Response(project_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            if request.user == project.user:
                project.delete()
                return Response({'detail': 'Project deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

class VectorList(APIView):
    queryset = Vector.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vectors = Vector.objects.filter(user=request.user)
        vectors = VectorSerializer(vectors, many=True)
        return Response(vectors.data, status=status.HTTP_200_OK)


class VectorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vector.objects.all()
    serializer_class = VectorSerializer


class ExportGeoJSON(APIView):
    def get(self, request, *args, **kwargs):
        vectors = Vector.objects.filter(user=request.user)

        geojson_data = self.serialize_as_geojson(vectors)
        vectors = VectorSerializer(geojson_data, many=True)
        return Response(geojson_data, status=status.HTTP_200_OK)
        # response = HttpResponse(geojson_data, content_type='application/json')
        # response['Content-Disposition'] = f'attachment; filename="{self.filename.replace(self.format,".geojson")}"'
        # return response

    def get_command(self, table):
        print(table)
        return f"""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(ST_AsGeoJSON(t.*)::json)
            )
        FROM "{table.lower().replace("-","_")}" as t;
        """

    def run_command(self, command):
        with connection.cursor() as cursor:
            cursor.execute(command)
            result = cursor.fetchone()[0]
        return result

    def serialize_as_geojson(self, vectors, many=True):
        if many:
            features = []
            for vector in vectors:
                table = vector.dbname
                data = self.run_command(self.get_command(table))
                # try:
                #     data = self.run_command(self.get_command(table))
                # except ProgrammingError:
                #     pass
                # else:
                features.append(data)
            return features
        else:
            return self.run_command(self.get_command(vectors))


class ResetPasswordView(APIView):
    queryset = User.objects.all()

    def post(self, request):
        to_email = request.data.get('email')
        if not to_email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=to_email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        current_site = get_current_site(request)

        mail_subject = 'Change your password'
        message = render_to_string(
            'changepassword.html',
            {
                'user': user,
                'domain': current_site.domain,  #'127.0.0.1:8000',#
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': PasswordResetTokenGenerator().make_token(user),
            },
        )

        email = EmailMessage(mail_subject, message, to=[to_email])
        email.send()
        messages.info(
            request,
            'Please confirm your email address to complete the registration',
        )
        return redirect('/')


class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.user == instance:
            self.perform_destroy(instance)
            return Response(status=204)
        else:
            return Response(
                {'detail': 'You do not have permission to delete this user.'},
                status=403,
            )


class UserUpdateView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            token = request.auth
            payload = token.payload
            user_id = payload['user_id']
        except (InvalidToken, KeyError):
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user_id != request.user.id:
            return Response(
                {'detail': 'Token user does not match update user.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request):
        print("A")
        serializer = RegisterSerializer(data=request.data)
        # TODO:
        ### Colocar um jeito de verificar erro
        ### Verificar questão de senha e email atualmente não aceitar email com . e senha curtas

        if not serializer.is_valid():
            print("ERROR",serializer.errors)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        if serializer.validated_data['password'] != request.data['password2']:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=request.data['username']).exists():
            return Response(
                {'error': 'Username is already taken'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=request.data['email']).exists():
            return Response(
                {'error': 'Email is already in use'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        return Response(
            RegisterSerializer(user).data, status=status.HTTP_201_CREATED
        )


class RetrieveUserView(APIView):
    #   permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user = UserSerializer(user)

        return Response(user.data, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class DjangoLoginView(LoginView):
    template_name = 'login.html'
    form_class = AuthenticationForm

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, {})

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
    

class RasterPostView(APIView):
    # queryset = RasterFile.objects.all()
    serializer_class = RasterFileSerializer

    def options(self, request, *args, **kwargs):
        return Response({"methods": ["POST"]}, status=status.HTTP_200_OK)

    def post(self,request):
        print("A")
        print("AAAA",request.data)
        # print(request.data['raster'])
        raster_data = request.data['raster']
        name = request.data["name"]
        projectid = request.data['projectid']

        raster_create = RasterFile(
            name = name,raster=raster_data,user=request.user
        )
        # raster_create.save()
        project = get_object_or_404(Project,pk=projectid)  

        assert request.user == project.user
        raster_create.save()
        print("SAVED")
        project.raster.add(raster_create.id)
        project.save()
        print("SAVED2")
        # print("PROJECT SAVED",projectid)
        # bounds.append(geometry.extent)

        # save_instance.append(
            
        # )

        raster = get_object_or_404(raster_create.pk)

        return Response(
            {
                'message': 'Data saved successfully',
                'bounds': raster_create.tiles,
                'raster': RasterFileSerializer(raster),
            },
            status=status.HTTP_201_CREATED,
        )




def convert_to_MB(number):

    l = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    n = -1
    while number>1000:
        number = number/1024
        n+=1

    return f"{round(number,2)} {l[n]}"
    # return round(number / (1024*1024),2)

valid_format_rasters = ["tif","TIF","tiff","jp2"]

class RasterViewSet(viewsets.ModelViewSet):
    queryset = RasterFile.objects.all()
    serializer_class = RasterFileSerializer

    def create(self,request):
        raster_data = request.data['raster']
        name = request.data["name"]
        projectid = request.data['projectid']
        
        # print(dir(raster_data))
        # print(type(raster_data))
        # raster_format = raster_data.file.name.split(".")[-1]
        raster_format = raster_data.name.split(".")[-1]
        if raster_format not in valid_format_rasters:
            return Response({'message': f"The file format provided is not accepted ({raster_format}), valid options: {','.join(valid_format_rasters)}",},
                             status=status.HTTP_400_BAD_REQUEST,)

        if raster_data.size > 100 * 1024 * 1024:
            return Response({'message': f"The maximum file size that can be uploaded is 100MB. The file provided have {convert_to_MB(raster_data.size)}",},status=status.HTTP_400_BAD_REQUEST,)
        
        raster_create = RasterFile(
            name = name,raster=raster_data,user=request.user
        )
        
        project = get_object_or_404(Project,pk=projectid)  

        assert request.user == project.user
        
        try:
            raster_create.save()
        except Exception as e:
            return Response({'message': e},
                            status=status.HTTP_400_BAD_REQUEST,)
        project.raster.add(raster_create.id)
        project.save()
        raster = get_object_or_404(RasterFile,pk = raster_create.pk)
        bounds = raster.tiles
        bounds = [float(i) for i in bounds.split(",")]
        serial = RasterFileSerializer(raster)
        polygon = box(*bounds)

        print(polygon.centroid.x, polygon.centroid.y)
        return Response(
            {
                'message': 'Data saved successfully',
                'raster': serial.data,
                "bounds":bounds,
                "lon":polygon.centroid.x,
                "lat":polygon.centroid.y
            },
            status=status.HTTP_201_CREATED,
        )

    # @action(
    #     methods=['DELETE'],
    #     detail=False,
    # )
    # def delete(self, request: Request):
    #     delete_rasters = self.queryset.all()
    #     delete_rasters.delete()
    #     return Response(self.serializer_class(delete_rasters, many=True).data)


class RasterVisualization(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request,pk):
        # raster_id = request.data.get('raster')
        raster = get_object_or_404(RasterFile, pk=pk)
        assert request.user == raster.user

        visual_type = request.data.get('visual_type')
        params = request.data.get("params")

        ## 3 types:
        # -> multiband.
        # -> paletted.
        # -> single band gray.
        # -> single band pseudocolor.

        img = gdal.Open(raster.raster.url)
        if visual_type=="composition":
            b1 = params['R']
            b2 = params['G']
            b3 = params['B']
            r = Image.fromarray(normalize_ar(img.GetRasterBand(int(b1)+1).ReadAsArray()))
            g = Image.fromarray(normalize_ar(img.GetRasterBand(int(b2)+1).ReadAsArray()))
            b = Image.fromarray(normalize_ar(img.GetRasterBand(int(b3)+1).ReadAsArray()))

            image = Image.merge('RGB', (r, g, b))

        elif visual_type=="grayscale":
            b1 = params['Gray']
            ar = normalize_ar(img.GetRasterBand(int(b1)+1).ReadAsArray())

            image = Image.fromarray(ar)

        # elif visual_type=="paletted":

        #     b1 = request.data.get('b1')
        #     ar = normalize_ar(img.GetRasterBand(b1).ReadAsArray())

        with io.BytesIO() as buffer:
            image.save(buffer, format='PNG')
            image_data = buffer.getvalue()
        name = os.path.basename(raster.png.name)
        raster.png.save(name, File(io.BytesIO(image_data)))


        return Response(
            {
                'message': 'Data saved successfully',
                'png': raster.png.url,
            },
            status=status.HTTP_201_CREATED,
        )


class RasterCalculatorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request):

        raster_id = request.data.get('raster')
        raster = get_object_or_404(RasterFile, pk=raster_id)
        assert request.user == raster.user


class GeoJSONDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.get(pk=pk)
            serializer = GeoJsonFileSerializer(geojson_file)
            return Response(serializer.data)
        except GeoJSONFile.DoesNotExist:
            return Response(
                {'error': 'GeoJSON file not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request, pk):
        try:
            geojson_file = GeoJSONFile.objects.filter(group_id=pk)
        
            geojson_file.delete()
            return Response(
                {'message': 'GeoJSON file deleted successfully'},
                status=status.HTTP_204_NO_CONTENT,
            )
        except GeoJSONFile.DoesNotExist:
            return Response(
                {'error': 'GeoJSON file not found'},
                status=status.HTTP_404_NOT_FOUND,
            )


class GeoJSONListView(APIView):
    def get(self, request):
        geojson_files = GeoJSONFile.objects.all()
        serializer = GeoJsonFileSerializer(geojson_files, many=True)
        return Response(serializer.data)

    def delete(self, request):
        print('DELETING')
        GeoJSONFile.objects.all().delete()
        return Response(
            {'message': 'All GeoJSON files deleted successfully'},
            status=status.HTTP_204_NO_CONTENT,
        )


# class GeoJSONFileUploadViewSet(viewsets.ViewSet):
#     def create(self, request):
#         try:
#             geojson_data = json.loads(request.data['geojson'].read())
#             projectid = request.data['projectid']

#             if not isinstance(geojson_data.get('features'), list):
#                 raise ValueError('Invalid GeoJSON format')

#             project = get_object_or_404(Project, pk=projectid)
#             assert request.user == project.user

#             geojson_file = request.FILES.get('geojson')
#             filename = geojson_file.name if geojson_file else 'Uploaded_File'

#             all_geometries = []
#             all_attributes = []

#             for feature in geojson_data['features']:
#                 geometry = feature.get('geometry')
#                 properties = feature.get('properties', {})
                
#                 # Adicione a geometria à lista de todas as geometrias
#                 all_geometries.append(GEOSGeometry(json.dumps(geometry)))

#                 # Adicione os atributos à lista de todos os atributos
#                 all_attributes.append(properties)

#             # Crie uma GeometryCollection com todas as geometrias
#             combined_geometry = GeometryCollection(all_geometries)

#             # Crie e salve a nova instância do modelo GeoJSONFile com a geometria e atributos
#             geo_instance = GeoJSONFile(
#                 name=filename, 
#                 user=request.user, 
#                 geojson=combined_geometry,  # Salvando a GeometryCollection
#                 attributes=all_attributes  # Salvando a lista de atributos
#             )
#             geo_instance.save()
#             project.geojson.add(geo_instance.id)
#             project.save()

#             return Response(
#                 {
#                     'message': 'Data saved successfully',
#                     'savedGeoJson': {
#                         'id': geo_instance.id,
#                         'name': geo_instance.name,
#                         'geojson': json.loads(geo_instance.geojson.geojson),
#                         'attributes': all_attributes,
#                     }
#                 },
#                 status=status.HTTP_201_CREATED,
#             )

#         except Exception as e:
#             print(e)
#             return Response(
#                 {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
#             )

class GeoJSONFileUploadViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            geojson_data = json.loads(request.data['geojson'].read())
            projectid = request.data['projectid']
            
            if not isinstance(geojson_data.get('features'), list):
                raise ValueError('Invalid GeoJSON format')
            
            project = get_object_or_404(Project, pk=projectid)
            assert request.user == project.user
            
            geojson_file = request.FILES.get('geojson')
            filename = geojson_file.name if geojson_file else 'Uploaded_File'
            
            next_group_id = GeoJSONFile.objects.latest('id').id + 1 if GeoJSONFile.objects.exists() else 1
            
            for feature in geojson_data['features']:
                geometry = feature.get('geometry')
                properties = feature.get('properties', {})
                
                geos_geometry = GEOSGeometry(json.dumps(geometry))
                
                geo_instance = GeoJSONFile( 
                    name=filename,
                    user=request.user,
                    geojson=geos_geometry,
                    attributes=properties,
                    group_id=next_group_id
                )
                geo_instance.save()
                project.geojson.add(geo_instance.id)
            
            project.save()
            
            return Response(
                {
                    'message': 'Data saved successfully', 
                    'group_id': next_group_id,
                    "savedGeoJson":GeoJsonFileSerializer(geo_instance).data  #TODO: resolver esse problema aqui, adicionar todas as geometrias, não uma só
                },
                    status=status.HTTP_201_CREATED,
            )
            
        except Exception as e:
            print(e)
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
            

class LeafletDrawUploadViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            geometry_data = request.data.get('geometry')
            projectid = request.data.get('projectid')
            
            if not geometry_data or not projectid:
                raise ValueError("Missing 'geometry' or 'projectid'")
            
            geometry_feature = geometry_data['geometry']
            project = get_object_or_404(Project, pk=projectid)
            assert request.user == project.user
            
            geometry = GEOSGeometry(json.dumps(geometry_feature))
            properties = geometry_data.get('properties', {})

            next_group_id = GeoJSONFile.objects.latest('id').id + 1 if GeoJSONFile.objects.exists() else 1
            
            geometry_instance = GeoJSONFile(
                name=request.data.get('name'),
                user=request.user,
                geojson=geometry,
                attributes=properties,
                group_id=next_group_id
            )
            
            geometry_instance.save()
            project.geojson.add(geometry_instance.id)
            project.save()
            
            return Response(
                {
                    'message': 'Data saved successfully',
                    'savedGeometry': {
                        'id': geometry_instance.id,
                        'geojson': json.loads(geometry_instance.geojson.geojson),
                        'properties': properties,
                    }
                },
                status=status.HTTP_201_CREATED,
            )
            
        except Exception as e:
            print("Error", e)
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
            
    #TODO: implementar a função de update
    def update(self, request, pk=None):
        try:
            geometry_data = request.data.get('geometry')
            if not geometry_data:
                raise ValueError("Missing 'geometry'")
            
            geometry_feature = geometry_data['geometry']
            geometry = GEOSGeometry(json.dumps(geometry_feature))
            
            try:
                geometry_instance = GeoJSONFile.objects.get(pk=pk, user=request.user)
            except GeoJSONFile.DoesNotExist:
                return Response(
                    {'error': 'Geometry not found'}, status=status.HTTP_404_NOT_FOUND
                )
            
            geometry_instance.geojson = geometry
            geometry_instance.save()
            
            return Response(
                {
                    'message': 'Geometry updated successfully',
                    'updatedGeometry': {
                        'id': geometry_instance.id,
                        'geojson': json.loads(geometry_instance.geojson.geojson)
                    }
                },
                status=status.HTTP_200_OK,
            )
        
        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
            
            
            

class UserRegistrarionView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegister

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'detail': 'User not found or wrong password'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response(
            {'access_token': access_token}, status=status.HTTP_200_OK
        )


class GeoJSONUploadView(APIView):
    #TODO: verificar se o sistema de coordenada está impactando a visualização
    #TODO: fazer a implementação do usuário.
    parser_classes = (MultiPartParser, JSONParser)
    
    def post(self, request, ):
        
        geojson_file = request.FILES.get('file')
        if not geojson_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file_name = geojson_file.name.split('.')[0]
        print(file_name)
        try:
            geojson_data = json.load(geojson_file)
            features = geojson_data.get('features', [])
        except json.JSONDecodeError:
            return Response({'error': 'Invalid GeoJSON file'}, status=status.HTTP_400_BAD_REQUEST)
        
        for feature in features:
            geometry = feature.get('geometry')
            properties = feature.get('properties', {})
            
            spatial_serializer = SpatialDataSerializer(data={'geom': geometry, 'file_name': file_name})
            if spatial_serializer.is_valid():
                spatial_obj = spatial_serializer.save()
                
                attribute_data = {
                    'spatial_data': spatial_obj.id,
                    'properties': properties
                }
                attribute_serializer = AttributesDataSerializer(data=attribute_data)
                if attribute_serializer.is_valid():
                    attribute_serializer.save()
                else:
                    spatial_obj.delete()  # Remove o objeto espacial se a validação do atributo falhar
                    return Response(attribute_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(spatial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Geojson data uploaded successfully'}, status=status.HTTP_201_CREATED)
    

class ShapefileUploadView(APIView):
    #TODO: verificar se o sistema de coordenada está impactando a vizualização
    #TODO: fazer a implementação do usuário.
    parser_classe = (MultiPartParser, JSONParser)
    
    def post(self, request, *args, **kwargs):
        zip_file = request.FILES.get('file')
        if not zip_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        with tempfile.TemporaryDirectory() as tmpdirname:
            try:
                with zipfile.ZipFile(zip_file, 'r') as zip_file:
                    zip_file.extractall(tmpdirname)
                
                shp_files = [f for f in os.listdir(tmpdirname) if f.endswith('.shp')]
                if not shp_files:
                    return Response({'error': 'Invalid shapefile'}, status=status.HTTP_400_BAD_REQUEST)
                
                shp_path = os.path.join(tmpdirname, shp_files[0])
                gdf = gpd.read_file(shp_path)

                for _, row in gdf.iterrows():
                    
                    geos_geometry = GEOSGeometry(row['geometry'].wkt)
                    
                    spatial_data_obj = SpatialDataT(geom=geos_geometry)
                    spatial_data_obj.save()
                    
                    properties = row.drop('geometry').to_dict()
                    attribute_data_obj = AttributeDataT(spatial_data=spatial_data_obj, properties=properties)
                    attribute_data_obj.save()
                    
            except zipfile.BadZipFile:
                return Response({'error': 'Invalid zip file'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Shapefile processed successfully'}, status=status.HTTP_201_CREATED)
    