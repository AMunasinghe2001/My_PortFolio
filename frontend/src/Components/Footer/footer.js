import React from "react";
import "./footer.css";
function footer() {
  return (
    <div>
      <footer>
        <div class="footerHead">
          <h2>Anushanga Munasinghe</h2>
        </div>

        <div class="footerHead">
          <p>
            A focused Web Developer building the of Websites and Web
            Applications that leads to the success of the overall product
          </p>
        </div>

        <div class="footerContainer">
          <div class="socialIcons">
            <a href="">
              <i class="fa-brands fa-facebook"></i>
            </a>
            <a href="">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="">
              <i class="fa-brands fa-twitter"></i>
            </a>
            <a href="">
              <i class="fa-brands fa-google-plus"></i>
            </a>
            <a href="">
              <i class="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
        <div class="footerBottom">
          <p>
            Copyright &copy;2023; Designed by{" "}
            <span class="designer">Anushanga Munasinghe</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default footer;
