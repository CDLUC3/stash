require 'spec_helper'
require 'tmpdir'
require 'fileutils'

module StashEngine
  describe Tenant do
    before(:each) do
      @tenants = StashEngine.tenants
      StashEngine.tenants = begin
        tenants = HashWithIndifferentAccess.new
        tenant_hash = YAML.load_file('spec/data/tenant-example.yml')['test']
        tenants['exemplia'] = HashWithIndifferentAccess.new(tenant_hash)
        tenants
      end

      app = double(Rails::Application)
      allow(app).to receive(:stash_mount).and_return('/stash')
      allow(StashEngine).to receive(:app).and_return(app)
    end

    after(:each) do
      StashEngine.tenants = @tenants
    end

    def expect_exemplia(tenant) # rubocop:disable Metrics/AbcSize
      expect(tenant.tenant_id).to eq('exemplia')
      expect(tenant.abbreviation).to eq('EX')
      expect(tenant.short_name).to eq('Exemplia')
      expect(tenant.long_name).to eq('University of Exemplia')
      expect(tenant.full_domain).to eq('stash-dev.example.edu')
      expect(tenant.domain_regex).to eq('example.edu$')
      expect(tenant.contact_email).to eq(%w[contact1@example.edu contact2@example.edu])
      expect(tenant.default_license).to eq('cc_by')
      expect(tenant.stash_logo_after_tenant).to eq(true)
      repo = tenant.repository
      expect(repo.type).to eq('exemplum')
      expect(repo.domain).to eq('repo-dev.example.edu')
      expect(repo.endpoint).to eq('http://repo-dev.example.edu:39001/sword/collection/stash')
      expect(repo.username).to eq('stash_submitter')
      expect(repo.password).to eq('correct​horse​battery​staple')
      ident = tenant.identifier_service
      expect(ident.shoulder).to eq('doi:10.5072/5555')
      expect(ident.account).to eq('stash')
      expect(ident.password).to eq('stash')
      expect(ident.id_scheme).to eq('doi')
      expect(ident.owner).to be_nil
      auth = tenant.authentication
      expect(auth.strategy).to eq('shibboleth')
      expect(auth.entity_id).to eq('urn:mace:incommon:example.edu')
      expect(auth.entity_domain).to eq('.example.edu')
    end

    describe :initialize do
      it 'creates a tenant' do
        tenant_hash = StashEngine.tenants['exemplia']
        tenant = Tenant.new(tenant_hash)
        expect_exemplia(tenant)
      end
    end

    describe :find do
      it 'finds the tenant' do
        tenant = Tenant.find('exemplia')
        expect_exemplia(tenant)
      end
    end

    describe :by_domain do
      it 'finds the tenant' do
        tenant = Tenant.by_domain('example.edu')
        expect_exemplia(tenant)
      end
      it 'returns the default for bad domains' do
        tenant = Tenant.by_domain('example.org')
        expect_exemplia(tenant)
      end
    end

    describe :by_domain_w_nil do
      it 'finds the tenant' do
        tenant = Tenant.by_domain_w_nil('example.edu')
        expect_exemplia(tenant)
      end
      it 'returns nil for bad domains' do
        tenant = Tenant.by_domain_w_nil('example.org')
        expect(tenant).to be_nil
      end
    end

    describe :omniauth_login_path do
      it 'delegates to the auth strategy' do
        tenant = Tenant.by_domain('example.edu')
        login_path = tenant.omniauth_login_path
        # TODO: don't hard-code this
        expect(login_path).to eq('https://stash-dev.example.edu/Shibboleth.sso/Login?target=https%3A%2F%2Fstash-dev.example.edu%2Fstash%2Fauth%2Fshibboleth%2Fcallback&entityID=urn%3Amace%3Aincommon%3Aexample.edu')
      end
    end

    describe :logo_file do
      it 'returns the tenant file if it exists' do
        tenant = Tenant.by_domain('example.edu')
        logo_filename = "logo_#{tenant.tenant_id}.jpg"
        Dir.mktmpdir('rails_root') do |rails_root|
          allow(Rails).to receive(:root).and_return(rails_root)
          tenant_images = File.join(rails_root, 'app', 'assets', 'images', 'tenants')
          FileUtils.mkdir_p(tenant_images)
          FileUtils.touch(File.join(tenant_images, logo_filename))
          expect(tenant.logo_file).to eq(logo_filename)
        end
      end

      it 'defaults if no tenant file exists' do
        tenant = Tenant.by_domain('example.edu')
        Dir.mktmpdir('rails_root') do |rails_root|
          allow(Rails).to receive(:root).and_return(rails_root)
          expect(tenant.logo_file).to eq(Tenant::DEFAULT_LOGO_FILE)
        end
      end
    end

    describe :shibboleth_login_path do
      it 'returns the login path' do
        tenant = Tenant.by_domain('example.edu')
        login_path = tenant.shibboleth_login_path
        expect(login_path).to eq('https://stash-dev.example.edu/Shibboleth.sso/Login?target=https%3A%2F%2Fstash-dev.example.edu%2Fstash%2Fauth%2Fshibboleth%2Fcallback&entityID=urn%3Amace%3Aincommon%3Aexample.edu')
      end
    end

    describe :google_login_path do
      it 'returns the login path' do
        tenant = Tenant.by_domain('example.edu')
        login_path = tenant.google_login_path
        expect(login_path).to eq('https://stash-dev.example.edu/stash/auth/google_oauth2')
      end

      it 'returns http if domain is localhost' do
        tenant = Tenant.by_domain('example.edu')
        allow(tenant).to receive(:full_domain).and_return('localhost:12345')
        login_path = tenant.google_login_path
        expect(login_path).to eq('http://localhost:12345/stash/auth/google_oauth2')
      end
    end

    describe :sword_params do
      it 'returns the Stash::Sword::Client parameter hash' do
        tenant = Tenant.by_domain('example.edu')
        expected = {
          collection_uri: 'http://repo-dev.example.edu:39001/sword/collection/stash',
          username: 'stash_submitter',
          password: 'correct​horse​battery​staple'
        }
        expect(tenant.sword_params).to eq(expected)
      end
    end

    describe :full_url do
      it 'builds a full URL from a tenant' do
        tenant = Tenant.by_domain('example.edu')
        expect(tenant.full_url('/doi:10.123/456')).to eq('https://stash-dev.example.edu/doi:10.123/456')
      end
    end

    describe :exists? do
      it 'checks if a tenant exists' do
        expect(Tenant.exists?('exemplia')).to be true
        expect(Tenant.exists?('pustule')).to be false
      end
    end

    describe :whitelist do
      it 'checks whitelist is not case sensitive' do
        tenant = Tenant.by_domain('example.edu')
        expect(tenant.whitelist.include?('carnuba.wax@example.com')).to be true
      end

      it 'checks whitelist is correct' do
        tenant = Tenant.by_domain('example.edu')
        expect(tenant.whitelisted?('carNuBa.waX@eXample.com')).to be true
        expect(tenant.whitelisted?('extra.crumbles@example.com')).to be true
        expect(tenant.whitelisted?('noodles.the.cat@example.com')).to be false
      end
    end
  end
end
