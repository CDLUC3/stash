# frozen_string_literal: true

module StashDatacite
  module Resource
    class MetadataEntry
      def initialize(resource, tenant)
        @resource = resource
        create_publisher(tenant)
        ensure_license(tenant)
        @resource.fill_blank_author!
      end

      def resource_type
        @resource_type = ResourceType
          .create_with(resource_id: @resource.id, resource_type: 'dataset', resource_type_general: 'dataset')
          .find_or_create_by(resource_id: @resource.id)
      end

      def title
        @title = @resource.title
      end

      def new_author
        @author = StashEngine::Author.new(resource_id: @resource.id)
      end

      def authors
        @authors = StashEngine::Author.where(resource_id: @resource.id)
      end

      def abstract
        @abstract = Description.type_abstract.find_or_create_by(resource_id: @resource.id)
      end

      def methods
        @methods = Description.type_methods.find_or_create_by(resource_id: @resource.id)
      end

      def other
        @other = Description.type_other.find_or_create_by(resource_id: @resource.id)
      end

      def new_subject
        @subject = Subject.new
      end

      def subjects
        @subjects = @resource.subjects
      end

      def new_contributor
        @contributor = Contributor.new(resource_id: @resource.id)
      end

      def contributors
        @contributors = Contributor.where(resource_id: @resource.id).where(contributor_type: :funder)
      end

      def new_related_identifier
        @related_identifier = RelatedIdentifier.new(resource_id: @resource.id)
      end

      def related_identifiers
        @related_identifiers = RelatedIdentifier.where(resource_id: @resource.id)
      end

      def new_geolocation_point
        @geolocation = Geolocation.new(resource_id: @resource.id)
        @geolocation_point = @geolocation.build_geolocation_point
      end

      def geolocation_points
        @geolocation_points = GeolocationPoint.only_geo_points(@resource.id)
      end

      def new_geolocation_box
        @geolocation = Geolocation.new(resource_id: @resource.id)
        @geolocation_box = @geolocation.build_geolocation_box
      end

      def geolocation_boxes
        @geolocation_boxes = GeolocationBox.only_geo_bbox(@resource.id)
      end

      def new_geolocation_place
        @geolocation = Geolocation.new(resource_id: @resource.id)
        @geolocation_place = @geolocation.build_geolocation_place
      end

      def geolocation_places
        @geolocation_places = GeolocationPlace.from_resource_id(@resource.id)
      end

      private

      def ensure_license(tenant)
        return unless @resource.rights.empty?

        license = StashEngine::License.by_id(tenant.default_license)
        @resource.rights.create(rights: license[:name], rights_uri: license[:uri])
      end

      def create_publisher(tenant)
        publisher = Publisher.where(resource_id: @resource.id).first
        @publisher = publisher.present? ? publisher : Publisher.create(publisher: tenant.short_name, resource_id: @resource.id)
      end
    end
  end
end
