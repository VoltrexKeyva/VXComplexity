export default {
  name: 'guildDelete',
  once: false,
  async execute(_, guild) {
    const owner = await guild.fetchOwner();

    console.log(
      `[${this.name}] Left a guild...\n|_ Name: ${guild.name}\n|_ ID: ${
        guild.id
      }\n|_ Member count: ${guild.memberCount.toLocaleString()}\n|_ Partnered: ${
        guild.partnered ? 'Yes' : 'No'
      }\n|_ Verified: ${guild.verified ? 'Yes' : 'No'}\n|_ Owner: ${
        owner.user.tag
      } [${owner.user.id}]`
    );
  }
};
