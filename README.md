# webgis-project

![Webgis Logo](/frontend/main/logo.png)

A website where you can manage your geospatial dataset.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Features](#features)
- [Contributing](#contributing)
- [Tests](#tests)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Installation

### Prerequisites

- Python 3.8+
- Node.js 18.17.0+
- npm 9.6.7+

### Steps

1. Clone the repository: `git clone https://github.com/felipempinto/webgis-project.git`
2. Navigate to the project directory: `cd frontend`
3. Install dependencies: `npm install`
4. Rename `.env.example` to `.env` and configure your environment variables.
5. Start the app: `npm start`
6. Navigate to the backend folder: `cd ../backend`
7. Create virtual environment: `python -m venv venv`
8. Activate venv:  linux: `source venv/bin/activate` windows: `venv/Scripts/activate`
9. Install dependencies: `pip install -r requirements.txt`
10. Start the app:  `python manage.py runserver`


## Usage

1. Open your browser and go to `http://localhost:3000`. To check backend, go to `http://localhost:8000/api`

![WebgisApp Screenshot](/frontend/app/screenshot.png)

## Configuration

You can customize AwesomeApp using the following configuration options:

- `TASK_DEFAULT_CATEGORY`: Set the default category for new tasks.
- `NOTIFICATION_INTERVAL`: Define the interval for task reminder notifications.

## Features

- Intuitive task creation and management.
- Categorize tasks for better organization.
- Set due dates and receive notifications.
- User-friendly interface for an enhanced user experience.

## Contributing

Contributions are welcome! To contribute to AwesomeApp:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-new-feature`
3. Make your changes and commit: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-new-feature`
5. Open a pull request, describing your changes in detail.

Please follow our [code of conduct](/CODE_OF_CONDUCT.md) and [contribution guidelines](/CONTRIBUTING.md).
