import { init } from "../index";

// we wait for the document to finish loading and then invoke the
// init() method to automatically attach all listeners to embedded SoundCloud iframes

const readyHandler = () => {
    init();
    document.removeEventListener( "DOMContentLoaded", readyHandler );
};
document.addEventListener( "DOMContentLoaded", readyHandler );
