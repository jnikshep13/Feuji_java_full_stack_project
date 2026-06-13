package com.feignClient.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.feignClient.Auth.UploadDocument;
import com.feignClient.Repository.DocumentRepository;
@Service
public class DocumentService {
	
	
	@Autowired
	private DocumentRepository repository;
	@Value("${file.upload-dir}")
	private String uploadDir;

	public UploadDocument upladDocument(
			Long authorizationId, MultipartFile file
			)throws IOException {
		Path uploadPath=Paths.get(uploadDir);
		if(!Files.exists(uploadPath)) {
			Files.createDirectories(uploadPath);
		}
		String fileName =
                UUID.randomUUID() + "_" + file.getOriginalFilename();
		
		   Path path = uploadPath.resolve(fileName);
		   
		   Files.copy(file.getInputStream(),path,  StandardCopyOption.REPLACE_EXISTING);
		   
		   UploadDocument document=new UploadDocument();
		   document.setAuthorizationId(authorizationId);
	        document.setFileName(file.getOriginalFilename());
	        document.setFileType(file.getContentType());
	        document.setFilePath(path.toString());
	        document.setUploadedAt(LocalDateTime.now());

	        return repository.save(document);
	}
	

	public Resource downLoadDocument(Long documentId)
	        throws Exception {

	    UploadDocument document =
	            repository.findById(documentId)
	            .orElseThrow(() ->
	                    new RuntimeException("Document Not Found"));

	    Path path = Paths.get(document.getFilePath());

	    Resource resource =
	            new UrlResource(path.toUri());

	    return resource;
	}
	public List<UploadDocument> getDocuments(
	        Long authorizationId) {

	    return repository.findByAuthorizationId(
	            authorizationId);
	}
}
