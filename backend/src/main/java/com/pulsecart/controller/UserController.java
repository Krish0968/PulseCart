package com.pulsecart.controller;

import com.pulsecart.dto.ChangePasswordRequest;
import com.pulsecart.dto.MessageResponse;
import com.pulsecart.dto.ProfileUpdateRequest;
import com.pulsecart.dto.ProfileUpdateResponse;
import com.pulsecart.dto.UserDto;
import com.pulsecart.exception.BadRequestException;
import com.pulsecart.exception.ResourceNotFoundException;
import com.pulsecart.model.User;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/users/me")
    @Transactional(readOnly = true)
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return ResponseEntity.ok(new UserDto(user));
    }

    @PutMapping("/users/profile")
    @Transactional
    public ResponseEntity<ProfileUpdateResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String newEmail = request.getEmail().trim();
        String newToken = null;

        // Validation for blank/invalid profile fields
        if (request.getFirstName().trim().isEmpty() || request.getLastName().trim().isEmpty()) {
            throw new BadRequestException("First name and last name cannot be blank.");
        }

        // Email uniqueness validation
        if (!newEmail.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Error: Email is already in use!");
            }
            user.setEmail(newEmail);
            newToken = jwtTokenProvider.generateTokenFromEmail(newEmail);
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");

        User updated = userRepository.save(user);
        return ResponseEntity.ok(new ProfileUpdateResponse(new UserDto(updated), newToken));
    }

    @PutMapping("/users/change-password")
    @Transactional
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password matches failed.");
        }

        // Encode and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
}
