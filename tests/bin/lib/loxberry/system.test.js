const fileHandler = require('../../../../bin/lib/fileHandler');
const System = require('../../../../bin/lib/loxberry/system');
const os = require('os');

jest.mock('../../../../bin/lib/fileHandler');
jest.mock('os');
describe('Loxberry System', () => {
  let system;
  beforeEach(() => {
    system = new System('test');
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Plugin functions', () => {
    const pluginDb = {
      plugins: {
        hash_test: {
          name: 'test',
          title: 'Test Plugin',
          version: '0.1.0',
          loglevel: '-1'
        },
        hash_other: {
          name: 'other',
          title: 'Other Plugin',
          version: '2.1.34',
          loglevel: '4'
        }
      }
    };
    beforeEach(() => {
      fileHandler.readJson.mockResolvedValue(pluginDb);
    });

    describe('getPlugins', () => {
      it('throws error when file can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('oh oh'));
        await expect(() => system.getPlugins()).rejects.toEqual(Error('oh oh'));
      });

      it('returns an empty list of plugins when no plugins are installed', async () => {
        fileHandler.readJson.mockResolvedValue({ plugins: {} });
        await expect(system.getPlugins()).resolves.toEqual([]);
      });

      it('returns a list of plugins', async () => {
        await expect(system.getPlugins()).resolves.toEqual([
          {
            name: 'test',
            title: 'Test Plugin',
            version: '0.1.0',
            loglevel: '-1'
          },
          {
            name: 'other',
            title: 'Other Plugin',
            version: '2.1.34',
            loglevel: '4'
          }
        ]);
      });
    });
    describe('pluginData', () => {
      it('throws error when file can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('oh oh'));
        await expect(() => system.pluginData()).rejects.toEqual(Error('oh oh'));
      });

      it('returns an error when the plugin isnt installed', async () => {
        await expect(() => system.pluginData('foo')).rejects.toEqual(Error('Plugin was not found'));
      });

      it('returns the data from the default plugin', async () => {
        await expect(system.pluginData()).resolves.toEqual({
          name: 'test',
          title: 'Test Plugin',
          version: '0.1.0',
          loglevel: '-1'
        });
      });

      it('returns the data from a plugin thats given', async () => {
        await expect(system.pluginData('other')).resolves.toEqual({
          name: 'other',
          title: 'Other Plugin',
          version: '2.1.34',
          loglevel: '4'
        });
      });
    });
    describe('pluginVersion', () => {
      it('throws error when file can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('oh oh'));
        await expect(() => system.pluginVersion()).rejects.toEqual(Error('oh oh'));
      });

      it('returns an error when the plugin isnt installed', async () => {
        await expect(() => system.pluginVersion('foo')).rejects.toEqual(Error('Plugin was not found'));
      });

      it('returns the data from the default plugin', async () => {
        await expect(system.pluginVersion()).resolves.toEqual('0.1.0');
      });

      it('returns the data from a plugin thats given', async () => {
        await expect(system.pluginVersion('other')).resolves.toEqual('2.1.34');
      });
    });
    describe('pluginLogLevel', () => {
      it('throws error when file can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('oh oh'));
        await expect(() => system.pluginLogLevel()).rejects.toEqual(Error('oh oh'));
      });

      it('returns an error when the plugin isnt installed', async () => {
        await expect(() => system.pluginLogLevel('foo')).rejects.toEqual(Error('Plugin was not found'));
      });

      it('returns the data from the default plugin', async () => {
        await expect(system.pluginLogLevel()).resolves.toEqual('-1');
      });

      it('returns the data from a plugin thats given', async () => {
        await expect(system.pluginLogLevel('other')).resolves.toEqual('4');
      });
    });
  });

  describe('General functions', () => {
    const generalConfig = {
      Base: {
        Country: 'de',
        Lang: 'de',
        Systemloglevel: '6',
        Version: '2.2.1.2'
      },
      Network: {
        Friendlyname: 'Loxberry'
      },
      Miniserver: {
        1: { Name: 'Test MS', Ipaddress: '1.1.1.1' },
        2: { Name: 'MS Home', Ipaddress: '92.21.3.1' }
      },
      Webserver: { Port: '80' }
    };

    beforeEach(() => {
      fileHandler.readJson.mockResolvedValue(generalConfig);
    });

    describe('Miniserver function', () => {
      describe('getMiniserver', () => {
        it('should fail when config can not be read', async () => {
          fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
          await expect(system.getMiniserver()).rejects.toEqual(Error('cannot read config file'));
        });
        it('should return an empty list of Miniserver when no Miniserver is configured', async () => {
          fileHandler.readJson.mockResolvedValue({ Miniservers: {} });
          await expect(system.getMiniserver()).resolves.toEqual([]);
        });
        it('should return a list of Miniserver', async () => {
          await expect(system.getMiniserver()).resolves.toEqual([
            { Name: 'Test MS', Ipaddress: '1.1.1.1' },
            { Name: 'MS Home', Ipaddress: '92.21.3.1' }
          ]);
        });
      });
      describe('getMiniserverByIp', () => {
        it('should fail when config can not be read', async () => {
          fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
          await expect(system.getMiniserverByIp()).rejects.toEqual(Error('cannot read config file'));
        });
        it('should throw an error when no Miniserver matches', async () => {
          await expect(system.getMiniserverByIp('10.10.10.10')).rejects.toEqual(Error('Miniserver with ip 10.10.10.10 was not found'));
        });
        it('should return a Miniserver', async () => {
          await expect(system.getMiniserverByIp('1.1.1.1')).resolves.toEqual({ Name: 'Test MS', Ipaddress: '1.1.1.1' });
          await expect(system.getMiniserverByIp('92.21.3.1')).resolves.toEqual({ Name: 'MS Home', Ipaddress: '92.21.3.1' });
        });
      });
      describe('getMiniserverByName', () => {
        it('should fail when config can not be read', async () => {
          fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
          await expect(system.getMiniserverByName()).rejects.toEqual(Error('cannot read config file'));
        });
        it('should throw an error when no Miniserver matches', async () => {
          await expect(system.getMiniserverByName('My Miniserver')).rejects.toEqual(
            Error('Miniserver with name "My Miniserver" was not found')
          );
        });
        it('should return a Miniserver', async () => {
          await expect(system.getMiniserverByName('Test MS')).resolves.toEqual({ Name: 'Test MS', Ipaddress: '1.1.1.1' });
          await expect(system.getMiniserverByName('MS Home')).resolves.toEqual({ Name: 'MS Home', Ipaddress: '92.21.3.1' });
        });
      });
    });

    describe('getCountry', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getCountry()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when languge is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Base: {} });
        await expect(system.getCountry()).resolves.toEqual(undefined);
      });
      it('should return the defined country', async () => {
        await expect(system.getCountry()).resolves.toEqual('de');
      });
    });
    describe('getLanguage', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getLanguage()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when languge is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Base: {} });
        await expect(system.getLanguage()).resolves.toEqual(undefined);
      });
      it('should return the defined langauge', async () => {
        await expect(system.getLanguage()).resolves.toEqual('de');
      });
    });
    describe('getVersion', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getVersion()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when Version is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Base: {} });
        await expect(system.getVersion()).resolves.toEqual(undefined);
      });
      it('should return the defined version', async () => {
        await expect(system.getVersion()).resolves.toEqual('2.2.1.2');
      });
    });
    describe('getLoglevel', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getLoglevel()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when SystemLogLevel is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Base: {} });
        await expect(system.getLoglevel()).resolves.toEqual(undefined);
      });
      it('should return the defined loglevel', async () => {
        await expect(system.getLoglevel()).resolves.toEqual('6');
      });
    });
    describe('getFriendlyName', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getFriendlyName()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when Network is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Network: {} });
        await expect(system.getFriendlyName()).resolves.toEqual(undefined);
      });
      it('should return the defined name', async () => {
        await expect(system.getFriendlyName()).resolves.toEqual('Loxberry');
      });
    });
    describe('getWebserverPort', () => {
      it('should fail when config can not be read', async () => {
        fileHandler.readJson.mockRejectedValue(Error('cannot read config file'));
        await expect(system.getWebserverPort()).rejects.toEqual(Error('cannot read config file'));
      });
      it('should return undefined when Port is not present', async () => {
        fileHandler.readJson.mockResolvedValue({ Webserver: {} });
        await expect(system.getWebserverPort()).resolves.toEqual(undefined);
      });
      it('should return the defined port', async () => {
        await expect(system.getWebserverPort()).resolves.toEqual('80');
      });
    });
    describe('getHostname', () => {
      it('should fail when config can not be read', async () => {
        os.hostname.mockImplementation(() => {
          throw Error('cant detect hostname');
        });
        await expect(system.getHostname()).rejects.toEqual(Error('cant detect hostname'));
      });
      it('should return the hostname', async () => {
        os.hostname.mockReturnValue('fooBar');
        await expect(system.getHostname()).resolves.toEqual('fooBar');
      });
    });
    describe('getLocalIp', () => {
      it('should fail when config can not be read', async () => {
        os.networkInterfaces.mockReturnValue({});
        await expect(system.getLocalIp()).resolves.toEqual('127.0.0.1');
      });
      it('should return the local ip', async () => {
        os.networkInterfaces.mockReturnValue({ en1: [{ address: '10.10.1.2', family: 'IPv4', internal: false }] });
        await expect(system.getLocalIp()).resolves.toEqual('10.10.1.2');
      });
    });
    describe('dateToLox', () => {
      it('should return undefined when no date is passed', async () => {
        await expect(system.dateToLox()).rejects.toEqual(Error('Given date is not a valid date'));
      });
      it('should return loxone date', async () => {
        await expect(system.dateToLox(new Date('August 21, 2021 14:02:25 GMT+02:00'))).resolves.toEqual('398786545');
      });
      it('should return 0 on initial loxone date', async () => {
        await expect(system.dateToLox(new Date('Januar 01, 2009 00:00:00 GMT+02:00'))).resolves.toEqual('0');
      });
    });
    describe('loxToDate', () => {
      it('should throw error when no date is passed', async () => {
        await expect(system.loxToDate()).rejects.toEqual(Error('Positive number required'));
      });
      it('should throw werror when no number is passed', async () => {
        await expect(system.loxToDate('')).rejects.toEqual(Error('Positive number required'));
      });
      it('should return loxone date', async () => {
        await expect(system.loxToDate('398786545')).resolves.toEqual(new Date('August 21, 2021 14:02:25 GMT+02:00'));
      });
      it('should return 0 on initial loxone date', async () => {
        await expect(system.loxToDate('1')).resolves.toEqual(new Date('Januar 01, 2009 00:00:01 GMT+02:00'));
      });
    });
  });
});
