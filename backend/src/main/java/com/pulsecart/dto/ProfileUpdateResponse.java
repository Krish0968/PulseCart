package com.pulsecart.dto;

public class ProfileUpdateResponse {
    private UserDto user;
    private String token;

    public ProfileUpdateResponse() {}

    public ProfileUpdateResponse(UserDto user, String token) {
        this.user = user;
        this.token = token;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
