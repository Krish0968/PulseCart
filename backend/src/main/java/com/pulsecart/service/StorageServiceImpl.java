package com.pulsecart.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.pulsecart.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageServiceImpl implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageServiceImpl.class);

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.container-name:}")
    private String containerName;

    private BlobContainerClient containerClient;
    private boolean azureActive = false;
    private final Path localDir = Paths.get("uploads");

    @PostConstruct
    public void init() {
        // Ensure local folder exists
        try {
            Files.createDirectories(localDir);
        } catch (IOException e) {
            logger.error("Could not create local upload directory", e);
        }

        // Try to initialize Azure Blob Storage Client
        if (connectionString != null && !connectionString.trim().isEmpty() && !"none".equalsIgnoreCase(connectionString)) {
            try {
                BlobServiceClient client = new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();
                this.containerClient = client.getBlobContainerClient(containerName);
                
                // Try checking existence or creating
                if (!this.containerClient.exists()) {
                    this.containerClient.create();
                }
                azureActive = true;
                logger.info("Azure Blob Storage initialized successfully. Container: {}", containerName);
            } catch (Exception e) {
                logger.warn("Azure Blob Storage failed to initialize, falling back to local storage. Reason: {}", e.getMessage());
                azureActive = false;
            }
        } else {
            logger.info("No Azure connection string found. Local storage fallback active.");
            azureActive = false;
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        // Sanitize original file name
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        
        String cleanName = UUID.randomUUID().toString() + extension;

        if (azureActive) {
            try {
                BlobClient blobClient = containerClient.getBlobClient(cleanName);
                blobClient.upload(file.getInputStream(), file.getSize(), true);
                logger.info("File uploaded to Azure Blob Storage: {}", cleanName);
                return blobClient.getBlobUrl();
            } catch (Exception e) {
                logger.error("Failed to upload to Azure Blob Storage. Falling back to local copy.", e);
                // Continue to local save fallback
            }
        }

        // Local file storage fallback save
        try {
            Path targetPath = localDir.resolve(cleanName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File saved to local folder: {}", cleanName);
            return "/uploads/" + cleanName;
        } catch (IOException e) {
            logger.error("Failed to save file locally", e);
            throw new BadRequestException("Could not store file locally: " + e.getMessage());
        }
    }
}
