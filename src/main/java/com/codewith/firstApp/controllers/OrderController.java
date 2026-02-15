package com.codewith.firstApp.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {
    
    @GetMapping("/order")
    public String order(@RequestParam String item){
        return "Your Order for " +item+ "has been received";
    }
}
