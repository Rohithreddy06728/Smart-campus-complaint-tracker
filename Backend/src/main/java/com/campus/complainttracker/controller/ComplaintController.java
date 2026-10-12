
package com.campus.complainttracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.campus.complainttracker.entity.Complaint;
import com.campus.complainttracker.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(
            ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Complaint createComplaint(
            @RequestBody Complaint complaint,
            Authentication authentication) {

        return complaintService.saveComplaint(
                complaint, authentication.getName());
    }

    @GetMapping
    public List<Complaint> getAllComplaints(
            Authentication authentication) {

        return complaintService.getAllComplaints(
                authentication.getName());
    }

    @GetMapping("/{id}")
    public Complaint getComplaintById(
            @PathVariable Long id,
            Authentication authentication) {

        return complaintService.getComplaintById(
                id, authentication.getName());
    }

    @PutMapping("/{id}")
    public Complaint updateComplaint(
            @PathVariable Long id,
            @RequestBody Complaint complaint,
            Authentication authentication) {

        return complaintService.updateComplaint(
                id, complaint, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        complaintService.deleteComplaint(
                id, authentication.getName());
    }
}
