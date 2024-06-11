# JSON File Server

This is a simple Node.js server for managing JSON files. It provides functionality to upload, delete, update, and retrieve data from JSON files stored on the server.

## Features

- **Upload JSON File**: Allows users to upload JSON files to the server.
- **Select JSON File**: Provides a dropdown menu to select and view the contents of uploaded JSON files.
- **Delete JSON File**: Allows users to delete selected JSON files from the server.
- **View Data**: Displays the JSON data in a formatted manner for easy viewing.
- **Add Data**: Enables users to add new data entries to the selected JSON file.
- **Update Data**: Allows users to update existing data entries in the selected JSON file.
- **Delete Data**: Enables users to delete specific data entries from the selected JSON file.

## Requirements

- Node.js installed on your machine.

## Installation

1. Clone this repository to your local machine.
    ```sh
    git clone https://github.com/IvanGrimm/json-crud-file-server
    ```
2. Navigate to the project directory in your terminal.
    ```sh
    cd json-crud-file-server
    ```
3. Install dependencies by running:
    ```sh
    npm install
    ```

## Usage

1. Start the server by running:
    ```sh
    npm start
    ```
2. Open your web browser and navigate to `http://localhost:3000`.
3. Use the provided forms and buttons to interact with JSON files.

## API Endpoints

- `GET /data?file=filename`: Retrieve data from the specified JSON file.
- `POST /data?file=filename`: Add new data to the specified JSON file.
- `PUT /data?file=filename&id=id`: Update data in the specified JSON file by ID.
- `DELETE /data?file=filename&id=id`: Delete data from the specified JSON file by ID.
- `POST /upload`: Upload a new JSON file.
- `DELETE /deleteFile?filename=filename`: Delete the specified JSON file.
- `GET /files`: Retrieve a list of available JSON files.

## To Be Added

- **Styling**: Improved UI styling for better user experience.
- **Refactoring**: Code refactoring for better maintainability and readability.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
