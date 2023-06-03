import {Button, Grid} from "@material-ui/core";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    button: {
        height: 100, // setting height/width is optional
        marginBottom: 20
    },
    label: {
        // Aligns the content of the button vertically.
        flexDirection: 'column'
    },
    icon: {
        fontSize: '32px !important',
        marginBottom: theme.spacing.unit
    }
}));

const NetworkToolsMenuIcon = ({icon, href, label}) => {

    const classes = useStyles();
    const Icon = icon;
    return (
        <Grid item md={3} sm={6} xs={6} style={{textAlign: 'center'}} >
            <Button component={Link} to={'/dashboard/network-tools/' + href} classes={{ root: classes.button, label: classes.label }} >
                <Icon className={classes.icon} />
                {label}
            </Button>
        </Grid>
    )
}

export default NetworkToolsMenuIcon;