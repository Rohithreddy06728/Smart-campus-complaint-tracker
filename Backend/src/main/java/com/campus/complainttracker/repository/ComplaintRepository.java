
package com.campus.complainttracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campus.complainttracker.entity.Complaint;

@Repository
public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findBySubmittedById(Long userId);
}
