FROM python:3.11.4

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgdal-dev \
    gdal-bin \
    libgeos-dev

RUN ldconfig

ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

COPY requirements_docker.txt /app/
RUN python -m pip install -r requirements_docker.txt
RUN pip install GDAL==`gdal-config --version`

EXPOSE 8000

COPY . /app/

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]