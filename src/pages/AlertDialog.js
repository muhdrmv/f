import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    backDrop: {
        backdropFilter: "blur(3px)",
        backgroundColor:'rgba(0,0,30,0.4)'
    },
}));

export default function AlertDialog({isOpen, closeMe, message}) {
    const classes = useStyles();
    const handleClose = () => {
        closeMe();
    };

    return (
        <div>
            <Dialog
                open={isOpen}
                onClose={handleClose}
                BackdropProps={{
                    classes: {
                        root: classes.backDrop,
                    },
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {/* <DialogTitle id="alert-dialog-title">
                    {message}
                </DialogTitle> */}
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
