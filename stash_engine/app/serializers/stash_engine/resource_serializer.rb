module StashEngine
  class ResourceSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id user_id current_resource_state_id identifier_id current_editor_id].freeze
    COLUMNS = (StashEngine::Resource.column_names - REJECT_COLUMNS).freeze

    # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    def hash
      # leaving out some things not used from DataCite schema: alternate identifiers, formats, languages, name
      # identifiers (linked by contributors), dcs_versions
      super.merge(
        user: UserSerializer.new(@my_model.user).hash,
        current_resource_state: ResourceStateSerializer.new(@my_model.current_resource_state).hash,
        authors: @my_model.authors.map { |i| AuthorSerializer.new(i).hash },
        edit_histories: @my_model.edit_histories.map { |i| EditHistorySerializer.new(i).hash },
        embargo: EmbargoSerializer.new(@my_model.embargo).hash,
        file_uploads: @my_model.file_uploads.map { |i| FileUploadSerializer.new(i).hash },
        share: ShareSerializer.new(@my_model.share).hash,
        submission_logs: @my_model.submission_logs.map { |i| SubmissionLogSerializer.new(i).hash },
        version: VersionSerializer.new(@my_model.stash_version).hash,
        contributors: @my_model.contributors.map { |i| ContributorSerializer.new(i).hash },
        datacite_dates: @my_model.datacite_dates.map { |i| DataciteDateSerializer.new(i).hash },
        descriptions: @my_model.descriptions.map { |i| DescriptionSerializer.new(i).hash },
        geolocations: @my_model.geolocations.map { |i| GeolocationSerializer.new(i).hash },
        publication_years: @my_model.publication_years.map { |i| PublicationYearSerializer.new(i).hash },
        publisher: PublisherSerializer.new(@my_model.publisher).hash,
        related_identifiers: @my_model.related_identifiers.map { |i| RelatedIdentifierSerializer.new(i).hash },
        resource_type: ResourceTypeSerializer.new(@my_model.resource_type).hash,
        rights: @my_model.rights.map { |i| RightSerializer.new(i).hash },
        sizes: @my_model.sizes.map { |i| SizeSerializer.new(i).hash },
        subjects: @my_model.subjects.order(subject: :asc).map { |i| SubjectSerializer.new(i).hash }
      )
    end
    # rubocop:enable Metrics/AbcSize, Metrics/MethodLength

  end
end
