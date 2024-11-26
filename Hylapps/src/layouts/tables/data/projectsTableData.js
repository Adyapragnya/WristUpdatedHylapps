/* eslint-disable react/prop-types */
// @mui material components
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonProgress from "components/ArgonProgress";

// Images
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import logoJira from "assets/images/small-logos/logo-jira.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoWebDev from "assets/images/small-logos/logo-webdev.svg";
import logoXD from "assets/images/small-logos/logo-xd.svg";

function Completion({ value, color }) {
  return (
    <ArgonBox display="flex" alignItems="center">
      <ArgonTypography variant="caption" color="text" fontWeight="medium">
        {value}%&nbsp;
      </ArgonTypography>
      <ArgonBox width="8rem">
        <ArgonProgress value={value} color={color} variant="gradient" label={false} />
      </ArgonBox>
    </ArgonBox>
  );
}

const action = (
  <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small">
    more_vert
  </Icon>
);

const projectsTableData = {
  columns: [
    { name: "name", align: "left" },
    { name: "source", align: "left" },
    { name: "destination", align: "left" },
    { name: "last_port", align: "center" },
    { name: "speed", align: "center" },
    { name: "progress_to_eta", align: "center" },
   
  ],

  rows: [
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Aeolian Sky
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        Chennai
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     BrimStone
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        Alaska
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Phoniex
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        Houston
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },

    {
      name: <ArgonTypography variant="button" color="text" fontWeight="medium">
     Ash
      </ArgonTypography>,
      source: (
        <ArgonTypography variant="button" color="text" fontWeight="medium">
        England
        </ArgonTypography>
      ),
      destination: (
        <ArgonTypography variant="caption" color="text" fontWeight="medium">
         Singapore port
        </ArgonTypography>
      ),
      last_port:   <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12.001 , 21.2323
    </ArgonTypography>,
      speed:  <ArgonTypography variant="caption" color="text" fontWeight="medium">
      12
    </ArgonTypography>,
      progress_to_eta: <Completion value={30} color="info" />,
     
    },
  
   
    
  ],
};

export default projectsTableData;
