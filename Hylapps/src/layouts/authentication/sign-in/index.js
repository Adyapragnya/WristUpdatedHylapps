import { useState, useContext } from "react"; // Import useContext
import { Link, useNavigate } from "react-router-dom";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from "../../../AuthContext"; // Adjusted import path

const bgImage = "/HYLA-LBackground.png";
const logoImage = "/Hyla-logo.png"; // Replace with the path to your logo image

function Illustration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { setRole, setId, setIsAuthenticated } = useContext(AuthContext); // Get setRole and setIsAuthenticated from AuthContext

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validate input
    if (!email || !password) {
      Swal.fire({
        title: "Error!",
        text: "Email and password are required.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }
  
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid email address.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }
  
    // Send credentials to backend
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseURL}/api/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Decode token to extract role
        const decodedToken = jwtDecode(data.token);
        const userRole = decodedToken.role; // Extract role
        const ID = decodedToken.id; // Extract userloginid

        setRole(userRole); // Update role in AuthContext
        console.log("User role:", userRole); // Check role in console

        setId(ID);
        console.log("User role:", ID); 
        await Swal.fire({
          title: "Success!",
          text: data.message || "You have successfully signed in.",
          icon: "success",
          confirmButtonText: "OK",
        });
  
        // Store token
        localStorage.setItem("token", data.token);
        
        // Update authentication state
        setIsAuthenticated(true); // Ensure the state reflects authentication status
        
        navigate("/SalesRadar"); // Redirect
        console.log("Token stored:", data.token);
        console.log("User role:", userRole); // Check role in console
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message || "Invalid email or password.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  
  return (
    <IllustrationLayout
      logo={logoImage} // Pass the logo prop
      title={<ArgonTypography variant="h3" color="white">HYLA</ArgonTypography>}
      description={<ArgonTypography variant="h6" color="white">Sign in with your email and password.</ArgonTypography>}
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
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mt={4} mb={1}>
          <ArgonButton color="info" size="large" fullWidth type="submit">
            Sign In
          </ArgonButton>
        </ArgonBox>
        {/* <ArgonBox mt={3} textAlign="center">
          <ArgonTypography variant="button" color="text" fontWeight="regular">
            Don&apos;t have an account?{" "}
            <ArgonTypography
              component={Link}
              to=""
              variant="button"
              color="info"
              fontWeight="medium"
            >
              Sign up
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox> */}
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default Illustration;
