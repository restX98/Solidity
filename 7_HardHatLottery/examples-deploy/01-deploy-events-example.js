module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Deploying Fund Me Contract...");
  log(deployer);
  log("\n\n\n\n");
  const eventsExample = await deploy("EventsExample", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmation: network.config.blockConfirmation || 1,
  });
};

module.exports.tags = ["all", "events"];
