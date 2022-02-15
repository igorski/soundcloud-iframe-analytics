import { init } from "../index";

// we wait for the document to finish loading and then invoke the
// init() method to automatically attach all listeners to embedded SoundCloud iframes

const readyHandler = async () => {
    document.removeEventListener( "DOMContentLoaded", readyHandler );

    // process all SoundCloud iframes and attach the Analytics listeners
    const embeds = await init();

    // for your debugging fun
    console.log( embeds );
    window.embeds = embeds;
};
document.addEventListener( "DOMContentLoaded", readyHandler );
