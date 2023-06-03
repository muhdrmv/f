import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    backDrop: {
        backdropFilter: "blur(3px)",
        backgroundColor: 'rgba(0,0,30,0.4)'
    },
}));

export default function AlertDialog({isOpen, closeMe, contentText, contentDescription, contentDatetime}) {
    const classes = useStyles();
    const [detailShow, setDetailShow] = useState(false)
    const handleClose = () => {
        closeMe();
    };
    const logDetails = []

    const fullLog =contentText? JSON.parse(contentText) : {}
    if (fullLog.data){
        delete fullLog.data
    }
    for (const key in fullLog ){
        logDetails.push({
            key:key.replaceAll(/_/g," "),
            value:fullLog[key]
        })
    }

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
                maxWidth="md"
            >
                <DialogTitle id="alert-dialog-title">
                    Log Details
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <b>{contentDescription}</b>
                        <br/>
                        <i>{contentDatetime}</i>

                        {detailShow ? (
                            <div>
                                <pre>
                                    {contentText}
                                </pre>
                            </div>
                        ) : (
                            <div>
                                {
                                    logDetails.map(i=>(
                                        <>
                                            <p style={{marginBottom:0,fontWeight:"bold",textTransform:"capitalize"}}>
                                                <i>{i.key}</i>
                                            </p>
                                            <p style={{marginTop:0,whiteSpace: "pre-wrap"}}>
                                                {i.value}
                                            </p>
                                        </>
                                    ))
                                }
                            </div>
                        )}

                    </DialogContentText>
                </DialogContent>
                <DialogActions>

                    <Button onClick={()=>setDetailShow(!detailShow)} color="primary" autoFocus>
                        {!detailShow ? "Detailed View" : "Summery View"}
                    </Button>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Close
                    </Button>

                </DialogActions>
            </Dialog>
        </div>
    );
}
