package com.codewith.firstApp.service.impl;

import java.util.List;

import com.codewith.firstApp.model.User;

public interface UserService {

    User saveUser(User user);

    List<User> getAllUsers();
}