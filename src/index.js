import { init } from './third_party/soundcloud';

// initialize the code as soon as the HTML Document is ready

const READY_EVENT  = "DOMContentLoaded";
const readyHandler = () => {
    init();
    document.removeEventListener( READY_EVENT, readyHandler );
};
document.addEventListener( READY_EVENT, readyHandler );

