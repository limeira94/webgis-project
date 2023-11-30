from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GeoJSONFile,RasterFile,Vector,Project
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

class VectorSerializer(serializers.ModelSerializer):
  class Meta:
    model = Vector
    fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = '__all__'
    # model = get_user_model()
    # fields = ('username', 'email',)
    # fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture']
    # read_only_fields = ()

class resetpasswordSerializer(serializers.ModelSerializer):
    
    username=serializers.CharField(max_length=100)
    password=serializers.CharField(max_length=100)

    class Meta:
        model=User
        fields='__all__'

    def save(self):
        username=self.validated_data['username']
        password=self.validated_data['password']
        if User.objects.filter(username=username).exists():
            user=User.objects.get(username=username)
            user.set_password(password)
            user.save()
            return user
        else:
            raise serializers.ValidationError({'error':'please enter valid crendentials'})

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
            required=True,
            validators=[UniqueValidator(queryset=User.objects.all())]
            )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        return user
    
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password']

#     def __init__(self, *args, **kwargs):
#         include_password2 = kwargs.pop('include_password2', False)

#         if include_password2:
#             self.Meta.fields += ['password2']
#         print("B"*50)
#         super().__init__(*args, **kwargs)

#     def validate(self, data):
#         if "password2" in data.keys():
#             if data['password'] != data['password2']:
#                 raise serializers.ValidationError("Passwords do not match")
#         print("A"*50)
#         return data

#     def create(self, validated_data):
#         validated_data.pop('password2', None)
#         return super().create(validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
       data = super().validate(attrs)
       refresh = self.get_token(self.user)
       data['refresh'] = str(refresh)
       data['access'] = str(refresh.access_token)
       return data


class GeoJsonFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoJSONFile
        fields = ('id', 'name', 'geojson')

class RasterFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RasterFile
        fields = ('id', 'name',"user", 'raster')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        if request and request.method == 'GET':
            # if instance.png.name!='':
            #     data['png'] = instance.png  
            if instance.tiles!='':
                data['tiles'] = instance.tiles    
        
        return data

class UserRegister(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user