import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import Swal from "sweetalert2";

const bgImage = "/HYLA-LBackground.png"; // Background image path
const logoImage = "/Hyla-logo.png"; // Logo image path

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Replace this with your API call
    const baseURL = process.env.REACT_APP_API_BASE_URL;
  
    const response = await fetch(`${baseURL}/api/organizations/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, tempPassword, newPassword }),
    });

    const result = await response.json();

    if (response.ok) {
      // Show success alert and redirect
      await Swal.fire({
        title: "Success!",
        text: "Your password has been reset successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
      
      // Redirect to sign in page (adjust the path as needed)
      navigate("/");
    } else {
      // Show error alert
      Swal.fire({
        title: "Error!",
        text: result.message || "An error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <IllustrationLayout
      logo={logoImage} // Pass the logo prop
      title={<ArgonTypography variant="h3" color="white">Reset Password</ArgonTypography>}
      description={<ArgonTypography variant="h6" color="white">Enter your email and new password.</ArgonTypography>}
      illustration={{
        image: bgImage,
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Temporary Password"
            size="large"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            required
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="New Password"
            size="large"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </ArgonBox>
        <ArgonBox mt={4} mb={1}>
          <ArgonButton color="info" size="large" fullWidth type="submit">
            Reset Password
          </ArgonButton>
        </ArgonBox>
        <ArgonBox mt={3} textAlign="center">
          <ArgonTypography variant="button" color="text" fontWeight="regular">
            Remembered your password?{" "}
            <ArgonTypography
              component={Link}
              to="/signin"
              variant="button"
              color="info"
              fontWeight="medium"
            >
              Sign In
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default ResetPassword;
