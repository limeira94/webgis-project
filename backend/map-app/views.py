from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


####  Just to show the two main options to do the same thing
# @api_view(['GET'])
# def homepage(request):
#     return Response({"message": "Hello, world!"})

# We will try to use the "class" options, just to keep it better coded, 
# But if something is easier to build using a simple function, we can begin with it
# and later change.
class HomePageView(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"}, status=status.HTTP_200_OK)
    

