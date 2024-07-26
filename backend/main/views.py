import json
import os

from django.contrib.gis.geos import GEOSGeometry
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Max
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import GeoJSONFile, Project, RasterFile
from .serializers import *

from shapely.geometry import box

class ProjectList(APIView):
    permissions = [permissions.IsAuthenticated]
    def post(self, request):
        # if request.user.is_authenticated:
        data = request.data
        data["user"] = request.user.pk
        serializer = ProjectSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # return Response({'detail': 'Authentication credentials were not provided.'},status=status.HTTP_401_UNAUTHORIZED)

    def get(self, request):
        #TODO: Return with public projects
        projects = Project.objects.filter(user=request.user)
        project_serializer = ProjectSerializer(projects, many=True)
        return Response(project_serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            if request.user == project.user:
                geojson_file = GeoJSONFile.objects.filter(project=project)
                geojson_file.delete()
                project.delete()
                return Response({'detail': 'Project deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)


class ProjectGetList(APIView):

    def get(self, request, pk):
        projects = get_object_or_404(Project,pk=pk)
        project_serializer = ProjectPkSerializer(projects)
        return Response(project_serializer.data, status=status.HTTP_200_OK)

class RasterPostView(APIView):
    serializer_class = RasterFileSerializer

    def options(self, request, *args, **kwargs):
        return Response({"methods": ["POST"]}, status=status.HTTP_200_OK)

    def post(self,request):
        raster_data = request.data['raster']
        name = request.data["name"]
        projectid = request.data['projectid']

        raster_create = RasterFile(
            name = name,raster=raster_data,user=request.user
        )

        project = get_object_or_404(Project,pk=projectid)  

        assert request.user == project.user
        raster_create.save()
        project.raster.add(raster_create.id)
        project.save()

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


class RasterVisualization(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request,pk):
        raster = get_object_or_404(RasterFile, pk=pk)
        assert request.user == raster.user

        visual_type = request.data.get('visual_type')
        params = request.data.get("params")

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
            geojson_file= GeoJSONFile.objects.get(pk=pk)
            group_id = geojson_file.group_id
            filter_groupid = GeoJSONFile.objects.filter(group_id=group_id)

            filter_groupid.delete()
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

#TODO: Olhar no Geojson model 
@method_decorator(csrf_exempt, name='dispatch')
class GeoJSONFileUploadViewSet(viewsets.ViewSet):
    
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        try:
            geojson_data = json.loads(request.data['geojson'].read())
            projectid = request.data['projectid']
            
            if not isinstance(geojson_data.get('features'), list):
                raise ValueError('Invalid GeoJSON format')
            
            project = get_object_or_404(Project, pk=projectid)
            if request.user != project.user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            geojson_file = request.FILES.get('geojson')
            # filename = geojson_file.name if geojson_file else 'Uploaded_File'
            name = os.path.splitext(geojson_file.name)
            filename = name[0]
            format_name = name[-1] 
            
            max_id = GeoJSONFile.objects.aggregate(max_id=Max('id'))['max_id']
            next_group_id = (max_id or 0) + 1
            
            all_geo_instances = []
            geoms = []
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
                all_geo_instances.append(geo_instance)

                ########################################
                #### NEW #####
                geom = Geojson(
                    geometry = geos_geometry,
                    attributes = properties
                )
                geoms.append(geom)
                ########################################

            with transaction.atomic():
                GeoJSONFile.objects.bulk_create(all_geo_instances)
                Geojson.objects.bulk_create(geoms)
                project.geojson.add(*[geo.id for geo in all_geo_instances])

                ########################################
                #### NEW
                vector = VectorFileModel.objects.create(
                    file=geojson_file,
                    format_name=format_name,
                    name = filename,
                    user = request.user,
                    )
                vector.geoms.set(geoms)
                vector.save()
                project.vector.add(vector)
                ########################################
                project.save()
            serializer = GeoJsonFileSerializer(all_geo_instances, many=True)

            return Response(
                {
                    'message': 'Data saved successfully', 
                    'group_id': next_group_id,
                    'savedGeoJson': serializer.data
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
            

    

