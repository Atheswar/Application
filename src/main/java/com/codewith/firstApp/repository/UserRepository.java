package com.codewith.firstApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.codewith.firstApp.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
