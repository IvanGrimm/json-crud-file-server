const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');

const PORT = 3000;
const JSON_FOLDER_PATH = 'data'; // Path to the folder containing JSON files

// Read data from JSON file
function readDataFromFile(filename) {
    try {
        const filePath = path.join(JSON_FOLDER_PATH, filename);
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data from file:', err);
        return [];
    }
}

// Write data to JSON file
function writeDataToFile(filename, data) {
    try {
        const filePath = path.join(JSON_FOLDER_PATH, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing data to file:', err);
    }
}

// Generate UUID for new item
function generateUUID() {
    return uuidv4();
}

// Generate a short unique identifier
function generateShortUUID() {
    return uuidv4().split('-')[0]; // Use only the first part of the UUID for brevity
}

// HTTP server
const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    const method = req.method.toUpperCase();
    
    // Handle file deletion request
    if (pathname === '/deleteFile' && method === 'DELETE') {
        const filename = query.filename;
        const filePath = path.join(JSON_FOLDER_PATH, filename);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error deleting file');
                }
            } else {
                console.log('File',  query.filename, 'deleted successfully' );
                if (!res.headersSent) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'File deleted successfully' }));
                }
            }
        });
        return; // Ensure no further processing happens for this request
    }

    if (pathname === '/data') {
        const filename = query.file || 'data.json'; // Default to data.json if no file specified
        let data = readDataFromFile(filename);

        if (method === 'GET') {
            // Handle GET request for retrieving data
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } else if (method === 'POST') {
            // Handle POST request for adding new data
            let newData = '';
            req.on('data', chunk => {
                newData += chunk.toString();
            });
            req.on('end', () => {
                newData = JSON.parse(newData);
                newData.id = generateUUID(); // Add UUID to new item
                data.push(newData);
                writeDataToFile(filename, data);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newData));
            });
        } else if (method === 'PUT') {
            // Handle PUT request for updating existing data
            let updatedData = '';
            req.on('data', chunk => {
                updatedData += chunk.toString();
            });
            req.on('end', () => {
                updatedData = JSON.parse(updatedData);
                const id = query.id;
                const index = data.findIndex(item => item.id === id);
                if (index !== -1) {
                    data[index] = { ...data[index], ...updatedData };
                    writeDataToFile(filename, data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data[index]));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Item not found');
                }
            });
        } else if (method === 'DELETE') {
            // Handle DELETE request for deleting data
            const id = query.id;
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                const deletedItem = data.splice(index, 1)[0];
                writeDataToFile(filename, data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(deletedItem));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Item not found');
            }
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    } else if (pathname === '/') {
        // Serve index.html file
        const indexPath = path.join(__dirname, 'index.html');
        fs.readFile(indexPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (pathname === '/upload' && method === 'POST') {
        // Handle file upload request
        console.log('Uploading file...');
        const form = new formidable.IncomingForm({
            uploadDir: JSON_FOLDER_PATH,
            keepExtensions: true
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error uploading file');
                return;
            }

            console.log('Received files:', files);

            // Check if files exist
            if (!files || !files.jsonFile) {
                console.error('No uploaded file found');
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('No uploaded file found');
                return;
            }

            const jsonFile = Array.isArray(files.jsonFile) ? files.jsonFile[0] : files.jsonFile;
            console.log('Processing file:', jsonFile);

            // Generate a unique filename with the original name
            const originalFilename = jsonFile.originalFilename;
            const shortUUID = generateShortUUID();
            const uniqueFilename = `${shortUUID}-${originalFilename}`;
            const newPath = path.join(JSON_FOLDER_PATH, uniqueFilename);
            console.log('New Unique Filename:', uniqueFilename);

            // Move the uploaded file to the new path
            fs.rename(jsonFile.filepath, newPath, (renameErr) => {
                if (renameErr) {
                    console.error('Error moving file:', renameErr);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error uploading file');
                    return;
                }

                console.log('File successfully moved to:', newPath);

                // Send response after file upload
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const responseBody = JSON.stringify({ message: 'File uploaded successfully', path: newPath });
                console.log('Response body:', responseBody);
                res.end(responseBody);
                console.log('Upload complete');
            });
        });
    } else if (pathname === '/files') {
        // Endpoint to fetch the list of JSON files
        fs.readdir(JSON_FOLDER_PATH, (err, files) => {
            if (err) {
                console.error('Error reading files from folder:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                const jsonFiles = files.filter(file => file.endsWith('.json'));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(jsonFiles));
            }
        });
    } else {
        // Handle invalid requests
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});