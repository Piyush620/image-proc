import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
// import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS

const API_URL = 'http://localhost:5000';  // Ensure your backend runs on this port

const Index = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [processedImages, setProcessedImages] = useState([]);
    const [inputImageURL, setInputImageURL] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);  // New state for loader

    const transformations = [
        { tag: 'greyscale', label: 'Grayscale' },
        { tag: 'contrast', label: 'Increase Contrast' },
        { tag: 'hsv', label: 'HSV Conversion' },
        { tag: 'edges', label: 'Edge Detection' },
        { tag: 'sharpen', label: 'Sharpen Image' },
        { tag: 'blur', label: 'Blur Image' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setInputImageURL(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleTagChange = (e) => {
        const tag = e.target.value;
        setSelectedTags(prev =>
            e.target.checked ? [...prev, tag] : prev.filter(t => t !== tag)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert('Please select an image.');

        const formData = new FormData();
        formData.append('image', selectedFile);
        selectedTags.forEach(tag => formData.append('tags', tag));

        setLoading(true);  // Start loader

        try {
            const response = await axios.post(`${API_URL}/process-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProcessedImages(response.data.images);
        } catch (error) {
            alert('Error processing image: ' + error.message);
        } finally {
            setLoading(false);  // Stop loader
        }
    };

    const downloadImage = (base64Image, filename) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64Image}`;
        link.download = filename;
        link.click();
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Image Processing App</h2>

            <form onSubmit={handleSubmit} className="p-4 shadow-lg rounded bg-light">
                <div className="mb-3">
                    <label htmlFor="imageUpload" className="form-label">Upload Image</label>
                    <input
                        type="file"
                        className="form-control"
                        id="imageUpload"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Select Transformations</label>
                    <div className="row">
                        {transformations.map(({ tag, label }) => (
                            <div key={tag} className="col-md-4 mb-2">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        value={tag}
                                        id={tag}
                                        onChange={handleTagChange}
                                    />
                                    <label htmlFor={tag} className="form-check-label">
                                        {label}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        'Process Image'
                    )}
                </button>
            </form>

            {inputImageURL && (
                <div className="mt-5 text-center">
                    <h4>Input Image Preview</h4>
                    <img
                        src={inputImageURL}
                        alt="Input Preview"
                        className="img-fluid rounded shadow-sm mt-3"
                        style={{ maxWidth: '400px' }}
                    />
                </div>
            )}

            {processedImages.length > 0 && (
                <div className="mt-5">
                    <h3 className="text-center mb-4">Processed Images</h3>
                    <div className="row">
                        {processedImages.map((img, idx) => (
                            <div key={idx} className="col-md-4 mb-4">
                                <div className="card shadow-sm">
                                    <img
                                        src={`data:image/png;base64,${img.image}`}
                                        alt={img.title}
                                        className="card-img-top"
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{img.title}</h5>
                                        <p className="card-text">{img.description}</p>
                                        <button
                                            className="btn btn-success w-100"
                                            onClick={() => downloadImage(img.image, `${img.title}.png`)}
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;
