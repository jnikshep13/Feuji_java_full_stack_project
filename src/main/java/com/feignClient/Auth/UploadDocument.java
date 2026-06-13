package com.feignClient.Auth;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Table(name="authorization_documenttttt")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadDocument {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

    private Long authorizationId;

    private String fileName;

    private String fileType;

    private String filePath;

    private LocalDateTime uploadedAt;
	

}
