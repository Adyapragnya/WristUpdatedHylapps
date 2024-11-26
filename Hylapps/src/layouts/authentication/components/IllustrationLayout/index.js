import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import PageLayout from "examples/LayoutContainers/PageLayout";
import Card from "@mui/material/Card";

function IllustrationLayout({ logo, title, description, header, illustration, children }) {
  return (
    <PageLayout>
      <ArgonBox
        sx={{
          height: "100vh",
          width: "100vw",
          backgroundImage: `url(${illustration.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay
            zIndex: 0
          },
        }}
      >
        <Grid container spacing={1} justifyContent="center" sx={{ textAlign: "center", zIndex: 1 }}>
          <Grid item xs={11} sm={8} md={6} lg={4} xl={3}>
            <Card
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Fully transparent card background
                backdropFilter: "blur(10px)", // Frosted glass effect
                borderRadius: "16px",
                zIndex: 1,
                position: "relative",
                padding: 3,
                marginTop : "-100px"
              }}
            >
              <ArgonBox>
                <ArgonBox mb={2}>
                  {logo && <img src={logo} alt="Logo" style={{ maxWidth: "135px", marginBottom: "-32px" }} />}
                </ArgonBox>
                {!header ? (
                  <>
                    <ArgonBox mb={1}>
                      <ArgonTypography variant="h4" fontWeight="bold">
                        {title}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonTypography variant="body2" fontWeight="regular" color="text">
                      {description}
                    </ArgonTypography>
                  </>
                ) : (
                  header
                )}
                <ArgonBox mt={3}>{children}</ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
    </PageLayout>
  );
}

IllustrationLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  logo: "",
  illustration: {},
};

IllustrationLayout.propTypes = {
  logo: PropTypes.string,
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  illustration: PropTypes.shape({
    image: PropTypes.string,
  }),
};

export default IllustrationLayout;
