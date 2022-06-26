import React from "react";
import ConnectButtonV2 from "./ConnectButtonV2";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    menuButton: {
        marginRight: 2,
      },
      title: {
        flexGrow: 1,
        fontSize: 26
      },
});

export default function LotteryAppBar() {

    const classes = useStyles()

    return(
        <AppBar style={{ background: 'green' }} position="flex">
            <Toolbar>

                <Typography variant="h6" align="center" className={classes.title} >
                <ConnectButtonV2>
                </ConnectButtonV2>
                </Typography>




            </Toolbar>
        </AppBar>
    )
}