Hooks.on("renderMeasuredTemplateConfig", function (config, html, cssConfig) {
    debugger
  $(html)
    .find(".header-button")
    .before(
      `<a id="blastzone"><i class="fas fa-bomb"></i>${game.i18n.localize(
        "blastzone.templateconfig.blast.text"
      )}</a>`
    );
  $(html)
    .find("#blastzone")
    .click(function (event) {

      new Dialog({
        title: game.i18n.localize("blastzone.templateconfig.dialog.title"),
        content: "<p>"+game.i18n.localize("blastzone.templateconfig.dialog.content")+"<br></p>",
        buttons: {
          one: {
            icon: '<i class="fas fa-bomb"></i>',
            label: game.i18n.localize("blastzone.templateconfig.dialog.yes"),
            callback: () => {
              let blast = new BlastZone(config.object._object);
              blast.blast();
            },
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("blastzone.templateconfig.dialog.no"),
            callback: () => {

            },
          },
        },
        default: "two",
      }).render(true);

      event.preventDefault();

    });
});