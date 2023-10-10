FROM python:3.11.4

ENV PYTHONUNBUFFERED 1

ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so

WORKDIR /app

COPY requirements_docker.txt /app/

RUN python -m pip install -r requirements_docker.txt

RUN apt-get update && apt-get install -y \
    libgdal-dev \
    gdal-bin \
    libgeos-dev

RUN pip install GDAL==`gdal-config --version`

EXPOSE 8000

COPY . /app/

CMD ["python", "manage.py", "runserver"]