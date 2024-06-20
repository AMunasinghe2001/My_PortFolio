import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "./countact.css";
import Footer from "../Footer/footer";

function Countact() {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_j7datbe", "template_77ryz1s", form.current, {
        publicKey: "YFo3I_BZFOWtFQs9w",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          alert("Success,");
        },
        (error) => {
          console.log("FAILED...", error.text);
          alert("Not Send You Massage!");
        }
      );
  };

  return (
    <div id="contact">
      <div className="hBody">
        <div className="contact-title animated-text">
          <h1 className="contact-title1">Hire</h1>
          <h1 className="contact-title2">Me</h1>
        </div>
        <div className="countact ">
          <form ref={form} onSubmit={sendEmail}>
            <label>Name</label>
            <br />
            <input type="text" placeholder="Full Name" name="user_name" />
            <br />
            <br />

            <label>Email</label>
            <br />
            <input
              type="email"
              placeholder="example@gmail.com"
              name="user_email"
            />
            <br />
            <br />

            <label>Subject</label>
            <br />
            <input type="text" placeholder="Subject" name="user_subject" />
            <br />
            <br />

            <label>Message</label>
            <br />
            <textarea placeholder="Message" name="user_massage"></textarea>
            <br />
            <br />

            <button type="submit" className="submit-btn">
              Send Message <i className="fas fa-paper-plane"></i>
            </button>
            <br />
            <br />
          </form>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Countact;
