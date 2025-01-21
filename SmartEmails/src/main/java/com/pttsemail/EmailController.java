package com.pttsemail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping ("/api/email")
@CrossOrigin(origins="*")
public class EmailController {
	
	
@Autowired
EmailService emailservice;
@PostMapping("/generate")
	public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest)
	{
	String response=emailservice.getEmailReply(emailRequest);
    return ResponseEntity.ok(response);
}
}


