package com.pulsecart.functions;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.TimerTrigger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.json.JSONObject;

public class RecommendationRegeneratorFunction {

    @FunctionName("regenerateRecommendationsTimer")
    public void run(
        @TimerTrigger(name = "keepAliveTrigger", schedule = "0 0 */2 * * *") String timerInfo,
        final ExecutionContext context
    ) {
        context.getLogger().info("Timer trigger executed for recommendation regeneration.");

        String appServiceUrl = System.getenv("PULSECART_API_URL");
        if (appServiceUrl == null || appServiceUrl.isEmpty()) {
            appServiceUrl = "http://localhost:8080"; // local fallback
        }

        String adminEmail = System.getenv("ADMIN_EMAIL");
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminEmail == null || adminEmail.isEmpty()) {
            adminEmail = "admin@pulsecart.com";
        }
        if (adminPassword == null || adminPassword.isEmpty()) {
            adminPassword = "password";
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            // 1. Authenticate and get JWT token
            String loginPayload = new JSONObject()
                    .put("email", adminEmail)
                    .put("password", adminPassword)
                    .toString();

            HttpRequest loginRequest = HttpRequest.newBuilder()
                    .uri(URI.create(appServiceUrl + "/api/auth/signin"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(loginPayload))
                    .build();

            HttpResponse<String> loginResponse = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());

            if (loginResponse.statusCode() != 200) {
                context.getLogger().severe("Authentication failed. HTTP Status: " + loginResponse.statusCode());
                return;
            }

            JSONObject jsonResponse = new JSONObject(loginResponse.body());
            String tokenType = jsonResponse.optString("tokenType", "Bearer");
            String accessToken = jsonResponse.getString("accessToken");

            // 2. Trigger recommendation regeneration
            HttpRequest regenRequest = HttpRequest.newBuilder()
                    .uri(URI.create(appServiceUrl + "/api/recommendations/regenerate"))
                    .header("Authorization", tokenType + " " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> regenResponse = client.send(regenRequest, HttpResponse.BodyHandlers.ofString());

            if (regenResponse.statusCode() == 200) {
                context.getLogger().info("Recommendation regeneration triggered successfully! Response: " + regenResponse.body());
            } else {
                context.getLogger().severe("Regeneration trigger failed. HTTP Status: " + regenResponse.statusCode() + ", Response: " + regenResponse.body());
            }

        } catch (Exception e) {
            context.getLogger().severe("Error occurred: " + e.getMessage());
        }
    }
}
