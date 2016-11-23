require 'zip'
require 'datacite/mapping'
require 'stash/wrapper'
require 'tempfile'
require 'stash_ezid/client'
require 'fileutils'
require 'stash_datacite/datacite_xml_builder'
require 'stash_datacite/stash_wrapper_builder'
require 'stash_datacite/dublin_core_builder'
require 'stash_datacite/data_one_manifest_builder'

module StashDatacite
  module Resource
    class ResourceFileGeneration
      def initialize(resource, current_tenant)
        @resource = resource
        @current_tenant = current_tenant
        @version = @resource.next_version
        ResourceFileGeneration.set_pub_year(@resource)
        @client = StashEzid::Client.new(@current_tenant.identifier_service.to_h)
      end

      def generate_identifier
        if @resource.identifier
          "#{@resource.identifier.identifier_type.downcase}:#{@resource.identifier.identifier}"
        else
          @client.mint_id
        end
      end

      def generate_xml(target_url, identifier)
        doi_value = identifier.split(':', 2)[1]
        uploads = uploads_list(@resource)

        datacite_xml_builder = Datacite::Mapping::DataciteXMLBuilder.new(
          doi_value: doi_value,
          se_resource: @resource,
          total_size_bytes: uploads.inject(0) { |sum, upload| sum + upload[:size] },
          version: @version
        )

        dc3_xml = datacite_xml_builder.build_datacite_xml(datacite_3: true)
        File.open("tmp/#{doi_value.gsub('/', '-')}-dc3.xml", 'w') { |f| f.write(dc3_xml) }
        @client.update_metadata(identifier, dc3_xml, target_url)

        dc4_resource = datacite_xml_builder.build_resource
        wrapper_xml = generate_stash_wrapper(dc4_resource, @version, uploads)

        [dc4_resource.write_xml, wrapper_xml]
      end

      def generate_stash_wrapper(dc4_resource, version_number, uploads)
        Stash::Wrapper::StashWrapperBuilder.new(
          dcs_resource: dc4_resource,
          version_number: version_number,
          uploads: uploads
        ).build_xml
      end

      def generate_dublincore
        # Added full namespace since otherwise it was erroring.
        StashDatacite::Resource::DublinCoreBuilder.new(resource: @resource, tenant: @current_tenant).build_xml_string
      end

      def generate_dataone
        DataONEManifestBuilder.new(uploads_list(@resource)).build_dataone_manifest
      end

      def generate_merritt_zip(folder, target_url, identifier)
        target_url = target_url
        FileUtils.mkdir_p(folder)

        uploads = @resource.file_uploads.newly_created.map do |i|
          { name: i.upload_file_name, type: i.upload_content_type, size: i.upload_file_size }
        end
        purge_existing_files

        zipfile_name = "#{folder}/#{@resource.id}_archive.zip"
        datacite_xml, stashwrapper_xml = generate_xml(target_url, identifier)

        File.open("#{folder}/#{@resource.id}_mrt-datacite.xml", 'w') do |f|
          f.write datacite_xml
        end
        File.open("#{folder}/#{@resource.id}_stash-wrapper.xml", 'w') do |f|
          f.write stashwrapper_xml
        end
        File.open("#{folder}/#{@resource.id}_mrt-oaidc.xml", 'w') do |f|
          f.write(generate_dublincore)
        end
        File.open("#{folder}/#{@resource.id}_mrt-dataone-manifest.txt", 'w') do |f|
          f.write(generate_dataone)
        end
        del_fn = create_delete_file(folder)

        Zip::File.open(zipfile_name, Zip::File::CREATE) do |zipfile|
          zipfile.add('mrt-datacite.xml', "#{folder}/#{@resource.id}_mrt-datacite.xml")
          zipfile.add('stash-wrapper.xml', "#{folder}/#{@resource.id}_stash-wrapper.xml")
          zipfile.add('mrt-oaidc.xml', "#{folder}/#{@resource.id}_mrt-oaidc.xml")
          zipfile.add('mrt-dataone-manifest.txt', "#{folder}/#{@resource.id}_mrt-dataone-manifest.txt")
          zipfile.add('mrt-delete.txt', del_fn) unless del_fn.nil?
          uploads.each do |d|
            zipfile.add((d[:name]).to_s, "#{folder}/#{@resource.id}/#{d[:name]}")
          end
        end

        zipfile_name
      end

      def purge_existing_files
        uploads_dir = StashEngine::Resource.uploads_dir
        resource_id = @resource.id
        %w(
          archive.zip
          mrt-datacite.xml
          mrt-dataone-manifest.txt
          mrt-delete.txt
          mrt-oaidc.xml
          stash-wrapper.xml
        ).each do |filename|
          file = File.join(uploads_dir, "#{resource_id}_#{filename}")
          File.delete(file) if File.exist?(file)
        end
      end

      def uploads_list(resource)
        files = []
        current_uploads = resource.current_file_uploads
        current_uploads.each do |u|
          hash = { name: u.upload_file_name, type: u.upload_content_type, size: u.upload_file_size }
          files.push(hash)
        end
        files
      end

      # create list of files to delete and return filename, return nil if no deletes needed
      def create_delete_file(folder)
        del_files = @resource.file_uploads.deleted
        return nil if del_files.blank?
        fn = "#{folder}/#{@resource.id}_mrt-delete.txt"
        File.open(fn, 'w') do |f|
          f.write del_files.map(&:upload_file_name).join("\n")
        end
        fn
      end

      # set the publication year to the current one if it has not been set yet
      def self.set_pub_year(resource)
        return if resource.publication_years.count > 0
        PublicationYear.create(publication_year: Time.now.year, resource_id: resource.id)
      end
    end
  end
end
