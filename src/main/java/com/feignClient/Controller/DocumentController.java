package com.feignClient.Controller;

import java.io.IOException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.feignClient.Auth.UploadDocument;
import com.feignClient.Repository.DocumentRepository;
import com.feignClient.Service.DocumentService;

import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {
	
	  private final DocumentService documentService;
	  
	  @Autowired
	  private DocumentRepository repository;
	  @PostMapping("/upload/{authorizationId}")
	  public ResponseEntity<UploadDocument> uploadDocument(
	          @PathVariable Long authorizationId,
	          @RequestParam("file") MultipartFile file)
	          throws IOException {

	      UploadDocument document =
	              documentService.upladDocument(
	                      authorizationId,
	                      file);

	      return ResponseEntity.ok(document);
	  }

	  @GetMapping("/download/{documentId}")
	  public ResponseEntity<Resource> downloadDocument(
	          @PathVariable Long documentId)
	          throws Exception {

	      UploadDocument document =
	              repository.findById(documentId)
	              .orElseThrow(() ->
	                      new RuntimeException("Document Not Found"));

	      Resource resource =
	              documentService.downLoadDocument(documentId);

	      return ResponseEntity.ok()
	              .header(
	                      HttpHeaders.CONTENT_DISPOSITION,
	                      "attachment; filename=\"" +
	                              document.getFileName() + "\"")
	              .body(resource);
	  }
	  @GetMapping("/authorization/{authorizationId}")
		public ResponseEntity<List<UploadDocument>>
		getDocuments(
		        @PathVariable Long authorizationId) {

		    return ResponseEntity.ok(
		            documentService.getDocuments(
		                    authorizationId));
		}
}
