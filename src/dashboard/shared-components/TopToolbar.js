import React from 'react';
import {lighten, makeStyles} from '@material-ui/core/styles';
import {CircularProgress, IconButton, Toolbar, Tooltip, Typography} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DoneIcon from '@material-ui/icons/Done';
import {Link} from 'react-router-dom';


const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft:  theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    title: {
        flex: '1 1 100%',
    },
}));


const TopToolbar = (props) => {
    const classes = useToolbarStyles();
    const {toolbarTitle, backLinkUrl, onClickDone, inProgress, toolbarIcon, extraIcons} = props;
    let ExtraIcons;
    if (extraIcons)
        ExtraIcons = extraIcons;
    return (
        <Toolbar className={classes.root} >
                <Typography className={classes.title} variant="h6" id="tableTitle" component="div"
                            style={{textAlign: 'left'}}>
                    {toolbarIcon}
                    {toolbarTitle}
                </Typography>

                { backLinkUrl &&
                <Tooltip title="Back">
                    <IconButton aria-label="back" component={Link} to={backLinkUrl} >
                        <ArrowBackIcon/>
                    </IconButton>
                </Tooltip>
                }

                { onClickDone &&
                <Tooltip title="Done">
                    { inProgress ?
                        (
                            <IconButton aria-label="Done" color="primary">
                                <CircularProgress size={24} />
                            </IconButton>
                        ) : (
                            <IconButton aria-label="Done" onClick={onClickDone} color="primary">
                                <DoneIcon/>
                            </IconButton>
                        )}
                </Tooltip>
                }

                {
                    extraIcons && <ExtraIcons />
                }


        </Toolbar>
    );
};

export default TopToolbar;