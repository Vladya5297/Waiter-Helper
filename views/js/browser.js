/* eslint-disable lines-around-comment */
/* eslint-disable no-unused-vars */

let mode = "initial";

// -----------------------------------
function configureSliders() {
  // hide settings menu on start
  $( "#hidden_menu" ).css( "display", "none" );
  $( "#slide_button" ).css( "display", "none" );

  // action on settings button
  $( "#settings" ).click( function() {
    // if settings not hidden
    if ( !isHidden( $( "#hidden_menu" ) ) ) {
      toggle( $( "#hidden_menu" ), "hide", 200 );

      // move slide button to the left
      $( "#slide_button" ).animate( { left: 0 }, 200 );

      // toggle slide button
      toggle( $( "#slide_button" ), "toggle", 200 );

      // if settings hidden
    } else if ( isHidden( $( "#hidden_menu" ) ) && !$( "#hidden_menu" ).hasClass( "slided" ) ) {
      toggle( $( "#hidden_menu" ), "show", 200 );

      // move slide button to it's origin position
      $( "#slide_button" ).animate( { left: 140 }, 200 );

      // toggle slide button
      toggle( $( "#slide_button" ), "toggle", 10 );

      // if settings slided
    } else {
      // remove slided class to prevent issues
      $( "#hidden_menu" ).removeClass( "slided" );

      // toggle slide button
      toggle( $( "#slide_button" ), "toggle", 200 );
    }

    // enable settings mode
    settingsModeToggle();
  } );

  // action on slide button
  $( "#slide_button" ).click( function() {
    // toggle settings menu
    if ( !isHidden( $( "#hidden_menu" ) ) ) {
      toggle( $( "#hidden_menu" ), "hide", 200 );
      $( "#hidden_menu" ).addClass( "slided" );
    } else {
      toggle( $( "#hidden_menu" ), "show", 200 );
      $( "#hidden_menu" ).removeClass( "slided" );
    }
    // move slide button after settings menu
    if ( $( "#slide_button" ).css( "left" ) === "0px" ) {
      $( "#slide_button" ).animate( { left: 140 }, 200 );
    } else {
      $( "#slide_button" ).animate( { left: 0 }, 200 );
    }
  } );
}

// -----------------------------------
function isHidden( obj ) {
  return $( obj ).css( "display" ) === "none";
}

// -----------------------------------
function settingsModeToggle() {
  if ( mode === "initial" ) {
    configureTable( $( ".table" ) );
    $( "#settings" ).css( "background-image", "url(../views/images/icon_cross.png)" );
    mode = "settings";
  } else if ( mode === "work" ) {
    $( ".table" ).css( "cursor", "grab" );
    $( ".table" ).draggable( "enable" );
    $( ".table" ).droppable( "enable" );
    $( ".table" ).resizable( "enable" );
    $( "#settings" ).css( "background-image", "url(../views/images/icon_cross.png)" );
    mode = "settings";
  } else {
    $( ".table" ).css( "cursor", "default" );
    $( ".table" ).draggable( "disable" );
    $( ".table" ).droppable( "disable" );
    $( ".table" ).resizable( "disable" );
    deselectTable( $( ".table" ) );
    $( "#settings" ).css( "background-image", "url(../views/images/icon_settings.png)" );
    mode = "work";
  }
}

// -----------------------------------
// toggle, hide, or show object with setted duration
function toggle( obj, effect, duration ) {
  // choose appropriate effect, set display flex on callback
  switch ( effect ) {
    case "toggle":
      $( obj ).toggle( "slide", {}, duration, function() {
        if ( !isHidden( obj ) ) {
          $( obj ).css( "display", "flex" );
        }
      } );
      break;
    case "hide":
      $( obj ).hide( "slide", {}, duration, function() {
        if ( !isHidden( obj ) ) {
          $( obj ).css( "display", "flex" );
        }
      } );
      break;
    case "show":
      $( obj ).show( "slide", {}, duration, function() {
        if ( !isHidden( obj ) ) {
          $( obj ).css( "display", "flex" );
        }
      } );
      break;
  }
}

// -----------------------------------
function clearSettings() {
  deselectTable( $( ".table" ) );
  $( "#table_name" ).val( $( this ).attr( "" ) );
  $( "#square_radio" ).prop( "checked", false )
    .prev().removeClass( "ui-checkboxradio-checked ui-state-active" );
  $( "#circle_radio" ).prop( "checked", false )
    .prev().removeClass( "ui-checkboxradio-checked ui-state-active" );
}

// -----------------------------------
// TODO remove if not needed
function clearTables() {
  timerStop( $( ".table" ) );
  $( ".table" ).css( "background-color", "white" );
  $( ".table" ).children( ".event_label" ).html( "" );
  $( ".table" ).children( ".timer" ).html( "" );
}

// -----------------------------------
function configureSettings() {
  $( "#new_table" ).click( function() {
    let tablesAmount;

    // get amount of tables
    if ( !$( ".table" ) ) { tablesAmount = 0; } else { tablesAmount = $( ".table" ).length + 1; }

    // string of new table
    const newTableString = "<div id='table_" + tablesAmount +
      "' class='table square selected' style='left: 50%; top: 30%;'>" +
      "<div class='table_label'></div>" +
      "<div class='event_label'></div>" +
      "<div class='timer'></div></div>";

    // append to work space
    $( ".work_space" ).append( newTableString );

    const newTable = $( "#table_" + tablesAmount );

    // make new table draggable and resizable
    configureTable( newTable );

    // make new table selected
    selectTable( newTable );

    // set table name
    setTableName( newTable );
  } );

  // unset selected object and information on unfocus
  $( ".work_space" ).click( function() {
    if ( this === event.target ) {
      clearSettings();
    }
  } );

  // radio style setup and changing shape on click
  $( "input[type='radio']" ).checkboxradio().click( function() {
    $( ".selected" ).removeClass( "square circle" ).addClass( $( this ).val() );
  } );

  // save button setup
  $( "#save_button" ).click( function() {
    $( ".selected" ).attr( "id", $( "#table_name" ).val() );
    setTableName( $( ".selected" ) );
  } );

  $( "#delete_button" ).click( function() {
    $( ".selected" ).remove();
    clearSettings();
  } );
}

// -----------------------------------
function deselectTable( table ) {
  $( table ).css( "box-shadow", "none" ).removeClass( "selected" );
}

// -----------------------------------
function selectTable( table ) {
  // work only in settings mode
  if ( mode === "settings" ) {
    // change border color and set 'selected' class
    deselectTable( $( ".table" ) );
    $( table ).css( "box-shadow", "0px 0px 3px 3px green" ).addClass( "selected" );

    // table name in input
    $( "#table_name" ).val( $( table ).attr( "id" ) );

    // radio in input
    if ( $( table ).hasClass( "square" ) ) {
      $( "#circle_radio" ).prev().removeClass( "ui-checkboxradio-checked ui-state-active" );
      $( "#square_radio" ).prop( "checked", true )
        .prev().addClass( "ui-checkboxradio-checked ui-state-active" );
    } else {
      $( "#square_radio" ).prev().removeClass( "ui-checkboxradio-checked ui-state-active" );
      $( "#circle_radio" ).prop( "checked", true )
        .prev().addClass( "ui-checkboxradio-checked ui-state-active" );
    }
  }
}

// -----------------------------------
function setTableName( table ) {
  $( table ).each( function() {
    $( this ).children( ".table_label" ).text( $( this ).attr( "id" ) );
  } );
}

// -----------------------------------
function configureTable( table ) {
  // cursor grab
  $( table ).css( "cursor", "grab" );

  table.click( function() {
    // set border color and information
    selectTable( this );
  } );

  // draggable settings
  table.draggable( {

    // auto z-index for ".table"
    stack: ".table",

    // container
    containment: ".work_space",

    // revert if drop on another table
    revert: "valid",
    revertDuration: 200,

    // z-index = 0 on create to hide tables under settings menu
    create: function( event, ui ) {
      $( this ).css( "z-index", 0 );
    },

    // hide menu
    start: function( event, ui ) {
      toggle( $( "#hidden_menu" ), "hide", 100 );
      $( "#slide_button" ).animate( { left: 0 }, 100 );
      $( ".table" ).css( "box-shadow", "none" );

      // borders green and cursor grabbing
      $( this ).css( { "box-shadow": "0px 0px 3px 3px green", cursor: "grabbing" } );
    },

    // show menu again when drop, reset z-indexes
    stop: function( event, ui ) {
      if ( !$( "#hidden_menu" ).hasClass( "slided" ) ) {
        toggle( $( "#hidden_menu" ), "show", 100 );
        $( "#slide_button" ).animate( { left: 140 }, 100 );
      }
      $( ".table" ).css( "z-index", 0 );

      // reset cursor to grab
      $( this ).css( "cursor", "grab" );
    }
  } );

  // droppable settings to prevent overlaying
  table.droppable( {

    // red borders on touch
    tolerance: "touch",
    over: function( event, ui ) {
      $( this ).css( "box-shadow", "0px 0px 3px 3px red" );
    },
    out: function( event, ui ) {
      $( this ).css( "box-shadow", "none" );
    }
  } );

  // resizable settings
  table.resizable( {

    // container
    containment: "parent",

    // points to drag
    handles: "se",

    // size limits
    minHeight: 100,
    maxHeight: 200,
    minWidth: 100,
    maxWidth: 200
  } );
}

// -----------------------------------
function configureDialog() {
  $( "#table_dialog" ).dialog( {
    dialogClass: "no-close",
    autoOpen: false,
    height: "200",
    width: "300",
    draggable: false,
    resizable: false,
    modal: true,
    position: { my: "center", at: "center", of: document },
    title: "New devices adding",
    buttons: [
      {
        text: "Save",
        class: "options_button",
        click: function() {
          dbInclude( "table", $( "#table_dialog" ).children( "#include_code" ).val(),
            $( "#table_dialog" ).children( "#include_name" ).val() );
        }
      },
      {
        text: "Cancel",
        class: "options_button",
        click: function() {
          $( "#table_dialog" ).dialog( "close" );
        }
      }
    ]
  } );

  $( "#card_dialog" ).dialog( {
    dialogClass: "no-close",
    autoOpen: false,
    height: "200",
    width: "300",
    draggable: false,
    resizable: false,
    modal: true,
    position: { my: "center", at: "center", of: document },
    title: "New cards adding",
    buttons: [
      {
        text: "Save",
        class: "options_button",
        click: function() {
          dbInclude( "card", $( "#card_dialog" ).children( "#include_code" ).val(),
            $( "#card_dialog" ).children( "#include_name" ).val() );
        }
      },
      {
        text: "Cancel",
        class: "options_button",
        click: function() {
          $( "#card_dialog" ).dialog( "close" );
        }
      }
    ]
  } );
}

// -----------------------------------
// initial call
configureSettings();
configureSliders();
configureDialog();
setTableName( $( ".table" ) );
