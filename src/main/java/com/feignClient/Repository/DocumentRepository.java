package com.feignClient.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feignClient.Auth.UploadDocument;

@Repository
public interface DocumentRepository
        extends JpaRepository<UploadDocument, Long> {

    List<UploadDocument> findByAuthorizationId(Long authorizationId);

}