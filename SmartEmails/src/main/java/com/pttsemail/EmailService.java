package com.pttsemail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class EmailService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApi;

    @Value("${gemini.api.key}")
    private String geminiKey;


    // Constructor injection for WebClient.Builder
    public EmailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://example.com") // Add your base URL here
                                       .build();
    }

    public String getEmailReply(EmailRequest emailRequest) {
        // Build the prompt for the request
        String prompt = buildPrompt(emailRequest);

        // Craft the request body
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {
                Map.of("parts", new Object[] {
                    Map.of("text", prompt)
                })
            }
        );

        // Send the request and process the response
        String response = webClient.post()
                .uri(geminiApi + geminiKey) // Make sure to build the correct URI
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                           .get(0)
                           .path("content")
                           .path("parts")
                           .get(0)
                           .path("text")
                           .asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email. Please don't generate a subject line.");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append(" Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal email:\n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}
