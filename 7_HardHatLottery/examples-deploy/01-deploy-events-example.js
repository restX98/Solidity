module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Deploying Events Example...");
  const eventsExample = await deploy("EventsExample", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmation: network.config.blockConfirmation || 1,
  });
  log("Events Example Deployed!");
};

module.exports.tags = ["all", "examples", "events"];
