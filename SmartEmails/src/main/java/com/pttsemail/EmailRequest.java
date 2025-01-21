package com.pttsemail;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EmailRequest {
    @JsonProperty("emailContent")
    private String emailContent;

    @JsonProperty("tone")
    private String tone;

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
