module StashEngine
  class StashIdentifierSerializer
    include SerializerMixin

    COLUMNS = StashEngine::Identifier.column_names.freeze

    def hash
      super.merge(
        resources: @my_model.resources.order(:id).map{|res| StashEngine::ResourceSerializer.new(res).hash},
        orcid_invitations: @my_model.orcid_invitations.map{|i| StashEngine::OrcidInvitationSerializer.new(i).hash}
        )
    end

  end
end