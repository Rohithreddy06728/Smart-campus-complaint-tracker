
package com.campus.complainttracker.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campus.complainttracker.entity.Complaint;
import com.campus.complainttracker.entity.User;
import com.campus.complainttracker.repository.ComplaintRepository;
import com.campus.complainttracker.repository.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"));
    }

    private Complaint findComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"));
    }

    private boolean isAdmin(User user) {
        return "ADMIN".equalsIgnoreCase(user.getRole());
    }

    private void requireOwnerOrAdmin(
            Complaint complaint, User user) {

        boolean isOwner =
                complaint.getSubmittedBy() != null
                && complaint.getSubmittedBy().getId()
                        .equals(user.getId());

        if (!isOwner && !isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this complaint");
        }
    }

    @Transactional
    public Complaint saveComplaint(
            Complaint complaint, String email) {

        User user = findUser(email);

        // Never trust the user ID or status sent by the frontend.
        complaint.setId(null);
        complaint.setSubmittedBy(user);
        complaint.setStatus("SUBMITTED");

        return complaintRepository.save(complaint);
    }

    @Transactional(readOnly = true)
    public List<Complaint> getAllComplaints(String email) {

        User user = findUser(email);

        if (isAdmin(user)) {
            return complaintRepository.findAll();
        }

        return complaintRepository
                .findBySubmittedById(user.getId());
    }

    @Transactional(readOnly = true)
    public Complaint getComplaintById(
            Long id, String email) {

        User user = findUser(email);
        Complaint complaint = findComplaint(id);

        requireOwnerOrAdmin(complaint, user);

        return complaint;
    }

    @Transactional
    public Complaint updateComplaint(
            Long id,
            Complaint request,
            String email) {

        User user = findUser(email);
        Complaint existing = findComplaint(id);

        requireOwnerOrAdmin(existing, user);

        // Only administrators can edit complaints.
        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can update complaints");
        }

        if (request.getTitle() != null) {
            existing.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }

        if (request.getCategory() != null) {
            existing.setCategory(request.getCategory());
        }

        if (request.getLocation() != null) {
            existing.setLocation(request.getLocation());
        }

        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }

        return complaintRepository.save(existing);
    }

    @Transactional
    public void deleteComplaint(Long id, String email) {

        User user = findUser(email);

        if (!isAdmin(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can delete complaints");
        }

        Complaint complaint = findComplaint(id);
        complaintRepository.delete(complaint);
    }
}
