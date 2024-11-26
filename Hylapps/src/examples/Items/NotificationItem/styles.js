function menuItem(theme) {
  const { palette, borders, transitions } = theme;

  const { secondary, light } = palette;
  const { borderRadius } = borders;

  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    color: secondary.main,
    py: 1,
    px: 2,
    borderRadius: borderRadius.md,
    transition: transitions.create("background-color", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    "&:not(:last-child)": {
      mb: 1.25,
    },

    "&:hover": {
      backgroundColor: light.main,
    },
  };
}

function menuImage(theme, ownerState) {
  const { functions, borders } = theme;
  const { borderRadius } = borders;

  return {
    display: "grid",
    placeItems: "center",
    // Set background color to yellow
    backgroundColor: 'lightgrey',

    "& img": {
      width: "100%",
      borderRadius: borderRadius.lg,
    },
  };
}


export { menuItem, menuImage };

