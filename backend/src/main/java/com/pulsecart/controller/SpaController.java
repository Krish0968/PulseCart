package com.pulsecart.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/register",
        "/products",
        "/search",
        "/cart",
        "/checkout",
        "/order-confirmation",
        "/orders",
        "/orders/{id}",
        "/product/{slug}",
        "/products/{slug}",
        "/category/{slug}",
        "/profile",
        "/support",
        "/admin"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
