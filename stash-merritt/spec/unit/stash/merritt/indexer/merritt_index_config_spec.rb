require 'spec_helper'

module Stash
  module Merritt
    describe MerrittIndexConfig do

      before(:all) do
        Stash::LOG_LEVEL ||= Logger::DEBUG
      end

      describe '#new' do

        it 'requires db_config_path' do
          expect { MerrittIndexConfig.new(url: 'http://example.org') }.to raise_error(ArgumentError)
        end

        it 'requires a url' do
          expect { MerrittIndexConfig.new(db_config_path: 'config/database.yml') }.to raise_error(ArgumentError)
        end

        it 'rejects an invalid url' do
          invalid_url = 'I am not a valid URL'
          expect do
            MerrittIndexConfig.new(
              db_config_path: 'config/database.yml',
              url: invalid_url
            )
          end.to raise_error(URI::InvalidURIError)
        end

        it 'rejects an invalid proxy_url' do
          invalid_url = 'I am not a valid URL'
          expect do
            MerrittIndexConfig.new(
              db_config_path: 'config/database.yml',
              url: 'http://example.org',
              proxy: invalid_url
            )
          end.to raise_error(URI::InvalidURIError)
        end

        it 'logs a warning if :proxy_url is used instead of :proxy' do
          out = StringIO.new
          Stash::Indexer.log_device = out
          begin
            proxy_url = 'whatever'
            MerrittIndexConfig.new(
              db_config_path: 'config/database.yml',
              url: 'http://example.org',
              proxy_url: proxy_url
            )
            logged = out.string
            expect(logged).to include('WARN')
            expect(logged).to include(proxy_url)
            expect(logged).to include(':proxy_url')
            expect(logged).to include(':proxy')
          rescue
            Stash::Indexer.log_device = $stdout
          end
        end

        it 'logs a warning if :proxy_uri is used instead of :proxy' do
          out = StringIO.new
          Stash::Indexer.log_device = out
          begin
            Stash::Indexer.log = logger
            MerrittIndexConfig.new(url: 'http://example.org', proxy_uri: proxy_url)
            logged = out.string
            expect(logged).to include('WARN')
            expect(logged).to include(proxy_url)
            expect(logged).to include(':proxy_uri')
            expect(logged).to include(':proxy')
          rescue
            Stash::Indexer.log_device = $stdout
          end
        end
      end

      describe '#uri' do
        it 'returns the URI as a URI' do
          url = 'http://example.org'
          config = MerrittIndexConfig.new(db_config_path: 'config/database.yml', url: url)
          expect(config.uri).to eq(URI(url))
        end
      end

      describe '#proxy_uri' do
        it 'returns the URI as a URI' do
          proxy_url = 'http://proxy.example.org'
          config = MerrittIndexConfig.new(db_config_path: 'config/database.yml', url: 'http://example.org/', proxy: proxy_url)
          expect(config.proxy_uri).to eq(URI(proxy_url))
        end
      end

      describe '#opts' do
        it 'captures the url as a string' do
          url = 'http://example.org'
          config = MerrittIndexConfig.new(db_config_path: 'config/database.yml', url: url)
          expect(config.opts[:url]).to eq(url)
        end

        it 'captures the proxy url as a string' do
          proxy = 'http://proxy.example.org'
          config = MerrittIndexConfig.new(db_config_path: 'config/database.yml', url: 'http://example.org/', proxy: proxy)
          expect(config.opts[:proxy]).to eq(proxy)
        end

        it 'captures arbitrary additional options' do
          config = MerrittIndexConfig.new(
            db_config_path: 'config/database.yml',
            url: 'http://example.org/',
            proxy: 'http://proxy.example.org',
            elvis: 'presley'
          )
          expect(config.opts[:elvis]).to eq('presley')
        end

        it 'captures arbitrary additional options when args passed as a hash' do
          opts = {
            db_config_path: 'config/database.yml',
            url: 'http://example.org/',
            proxy: 'http://proxy.example.org',
            elvis: 'presley'
          }
          config = MerrittIndexConfig.new(opts)
          expect(config.opts[:elvis]).to eq('presley')
        end

      end

      describe '#create_indexer' do
        it 'creates an indexer' do
          config = MerrittIndexConfig.new(
            db_config_path: 'config/database.yml',
            url: 'http://example.org/',
            proxy: 'http://proxy.example.org',
            elvis: 'presley'
          )
          metadata_mapper = instance_double(Stash::Indexer::MetadataMapper)
          indexer = config.create_indexer(metadata_mapper: metadata_mapper)
          expect(indexer).to be_a(MerrittIndexer)
        end
      end

      describe '#description' do
        it 'captures all opts' do
          opts = {
            url: 'http://example.org/',
            proxy: 'http://proxy.example.org',
            elvis: 'presley'
          }
          config = MerrittIndexConfig.new(db_config_path: 'config/database.yml', **opts)
          desc = config.description
          opts.each do |k, v|
            expect(desc).to include("#{k}: #{v}")
          end
        end
      end

      describe 'config file' do
        it 'reads a config from a config file' do
          env = ::Config::Factory::Environments.load_file('spec/data/stash-harvester.yml')[:test]
          config = Stash::Config.from_env(env)
          index_config = config.index_config
          expect(index_config).to be_a(MerrittIndexConfig)
          expect(index_config.db_config_path).to eq('config/database.yml')
        end
      end
    end
  end
end
